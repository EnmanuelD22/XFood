SET NOCOUNT ON;
SET XACT_ABORT OFF;
IF DB_NAME() NOT LIKE 'XFood[_]Validation[_]%' OR DB_NAME() = 'XFoodDB'
    THROW 51000, 'This test requires a newly created isolated validation database.', 1;
IF (SELECT COUNT(*) FROM dbo.__EFMigrationsHistory) <> 2 THROW 51000, 'Expected two applied migrations.', 1;
IF (SELECT COUNT(*) FROM sys.tables WHERE name <> '__EFMigrationsHistory') <> 35 THROW 51000, 'Expected 35 application tables.', 1;
IF (SELECT COUNT(*) FROM sys.check_constraints) <> 149 THROW 51000, 'Expected 149 CHECK constraints.', 1;
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE is_disabled=1 OR is_not_trusted=1) THROW 51000, 'Untrusted CHECK.', 1;
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE is_disabled=1 OR is_not_trusted=1) THROW 51000, 'Untrusted FK.', 1;
IF EXISTS (SELECT 1 FROM listings.Categories) THROW 51000, 'Category catalog must not contain invented seeds.', 1;
SELECT 'PASS: migrations, 35 tables, 149 enabled/trusted CHECKs and all FKs trusted; empty category catalog.';

BEGIN TRANSACTION;
BEGIN TRY
    DECLARE @user uniqueidentifier=NEWID(), @other uniqueidentifier=NEWID(), @est uniqueidentifier=NEWID(),
        @org uniqueidentifier=NEWID(), @cat uniqueidentifier=NEWID(), @listing uniqueidentifier=NEWID(),
        @member uniqueidentifier=NEWID(), @now datetimeoffset(3)=TODATETIMEOFFSET(SYSUTCDATETIME(), '+00:00');
    INSERT [identity].Users (Id,EmailConfirmed,PhoneNumberConfirmed,TwoFactorEnabled,LockoutEnabled,AccessFailedCount)
        VALUES (@user,0,0,0,0,0),(@other,0,0,0,0,0);
    INSERT establishments.Establishments (Id,Name,ContactName,ContactEmail,ContactPhone,Address,Latitude,Longitude,TimeZoneId,Status,CreatedByUserId,CreatedAtUtc)
        VALUES (@est,'SQL test','Test','test@example.invalid','000','Test',18,-69,'America/Santo_Domingo',1,@user,@now);
    INSERT establishments.EstablishmentMembers (Id,EstablishmentId,UserId,Role,IsPrimary,JoinedAtUtc,GrantedByUserId)
        VALUES (@member,@est,@user,1,1,@now,@user);
    INSERT donations.Organizations (Id,Name,ContactName,ContactEmail,ContactPhone,Address,VerificationStatus,CreatedByUserId,CreatedAtUtc)
        VALUES (@org,'SQL test','Test','test@example.invalid','000','Test',1,@user,@now);
    INSERT donations.OrganizationMembers (Id,OrganizationId,UserId,Role,IsPrimary,JoinedAtUtc,GrantedByUserId)
        VALUES (NEWID(),@org,@user,1,1,@now,@user);
    INSERT listings.Categories (Id,Name,IsActive,CreatedAtUtc) VALUES (@cat,'Temporary test category',1,@now);
    INSERT listings.Listings (Id,EstablishmentId,CreatedByUserId,Title,Description,CategoryId,Mode,Status,InitialQuantity,AddedQuantity,
        TransferredInQuantity,TransferredOutQuantity,AvailableQuantity,AssignedQuantity,FulfilledQuantity,WrittenOffQuantity,
        Currency,PickupInstructions,FoodSafetyDeclared,IsFoodFit,PickupStartsAtUtc,PickupDeadlineUtc,CreatedAtUtc)
        VALUES (@listing,@est,@user,'SQL test','Test',@cat,2,1,1,0,0,0,1,0,0,0,'DOP','Test',1,1,DATEADD(hour,1,@now),DATEADD(hour,2,@now),@now);
    SELECT 'PASS: valid category, listing, establishment and organization with principal insert successfully in one transaction.';
    BEGIN TRY
        UPDATE listings.Listings SET AvailableQuantity=-1 WHERE Id=@listing;
        THROW 51000, 'Negative stock accepted.', 1;
    END TRY BEGIN CATCH IF ERROR_NUMBER()<>547 THROW; END CATCH;
    BEGIN TRY
        UPDATE listings.Listings SET CategoryId=NEWID() WHERE Id=@listing;
        THROW 51000, 'Missing category accepted.', 1;
    END TRY BEGIN CATCH IF ERROR_NUMBER()<>547 THROW; END CATCH;
    BEGIN TRY
        UPDATE listings.Listings SET DiscountedUnitPrice=1 WHERE Id=@listing;
        THROW 51000, 'Donation with price accepted.', 1;
    END TRY BEGIN CATCH IF ERROR_NUMBER()<>547 THROW; END CATCH;
    BEGIN TRY
        INSERT establishments.EstablishmentMembers (Id,EstablishmentId,UserId,Role,IsPrimary,JoinedAtUtc,GrantedByUserId)
            VALUES (NEWID(),@est,@other,2,1,@now,@user);
        THROW 51000, 'Duplicate establishment principal accepted.', 1;
    END TRY BEGIN CATCH IF ERROR_NUMBER() NOT IN (2601,2627) THROW; END CATCH;
    BEGIN TRY
        INSERT donations.OrganizationMembers (Id,OrganizationId,UserId,Role,IsPrimary,JoinedAtUtc,GrantedByUserId)
            VALUES (NEWID(),@org,@other,2,1,@now,@user);
        THROW 51000, 'Duplicate organization principal accepted.', 1;
    END TRY BEGIN CATCH IF ERROR_NUMBER() NOT IN (2601,2627) THROW; END CATCH;
    SELECT 'PASS: negative stock, missing category, donation price and duplicate principals rejected by SQL Server.';
    SAVE TRANSACTION BeforeReplacement;
    UPDATE establishments.EstablishmentMembers SET RevokedAtUtc=@now,RevokedByUserId=@user WHERE Id=@member;
    INSERT establishments.EstablishmentMembers (Id,EstablishmentId,UserId,Role,IsPrimary,JoinedAtUtc,GrantedByUserId)
        VALUES (NEWID(),@est,@other,1,1,@now,@user);
    IF (SELECT COUNT(*) FROM establishments.EstablishmentMembers WHERE EstablishmentId=@est AND IsPrimary=1 AND RevokedAtUtc IS NULL)<>1
        THROW 51000, 'Replacement failed.', 1;
    ROLLBACK TRANSACTION BeforeReplacement;
    IF NOT EXISTS (SELECT 1 FROM establishments.EstablishmentMembers WHERE Id=@member AND RevokedAtUtc IS NULL AND IsPrimary=1)
        THROW 51000, 'Rollback did not restore principal.', 1;
    SELECT 'PASS: principal replacement and rollback preserve the original membership period.';
    ROLLBACK TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT>0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
DBCC CHECKCONSTRAINTS WITH ALL_CONSTRAINTS;
