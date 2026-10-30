BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    IF SCHEMA_ID(N'listings') IS NULL EXEC(N'CREATE SCHEMA [listings];');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    IF SCHEMA_ID(N'notifications') IS NULL EXEC(N'CREATE SCHEMA [notifications];');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    IF SCHEMA_ID(N'donations') IS NULL EXEC(N'CREATE SCHEMA [donations];');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    IF SCHEMA_ID(N'establishments') IS NULL EXEC(N'CREATE SCHEMA [establishments];');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    IF SCHEMA_ID(N'administration') IS NULL EXEC(N'CREATE SCHEMA [administration];');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    IF SCHEMA_ID(N'reservations') IS NULL EXEC(N'CREATE SCHEMA [reservations];');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [identity].[AccountProfiles] (
        [UserId] uniqueidentifier NOT NULL,
        [DisplayName] nvarchar(200) NOT NULL,
        [Status] int NOT NULL,
        [CreatedAtUtc] datetimeoffset(3) NOT NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_AccountProfiles] PRIMARY KEY ([UserId]),
        CONSTRAINT [CK_AccountProfiles_DisplayName_NotBlank] CHECK (LEN(LTRIM(RTRIM([DisplayName]))) > 0),
        CONSTRAINT [CK_AccountProfiles_Status] CHECK ([Status] IN (1, 2)),
        CONSTRAINT [CK_AccountProfiles_Utc] CHECK (([CreatedAtUtc] IS NULL OR DATEPART(TZOFFSET, [CreatedAtUtc]) = 0)),
        CONSTRAINT [FK_AccountProfiles_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [listings].[Categories] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(100) COLLATE Latin1_General_100_CI_AI NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAtUtc] datetimeoffset(3) NOT NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_Categories] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Categories_Name_NotBlank] CHECK (LEN(LTRIM(RTRIM([Name]))) > 0),
        CONSTRAINT [CK_Categories_Utc] CHECK (([CreatedAtUtc] IS NULL OR DATEPART(TZOFFSET, [CreatedAtUtc]) = 0))
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [notifications].[DeviceRegistrations] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [InstallationId] uniqueidentifier NOT NULL,
        [Platform] int NOT NULL,
        [Provider] varchar(50) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [ProtectedPushToken] nvarchar(max) NOT NULL,
        [TokenHash] char(64) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [RegisteredAtUtc] datetimeoffset(3) NOT NULL,
        [RefreshedAtUtc] datetimeoffset(3) NOT NULL,
        [RevokedAtUtc] datetimeoffset(3) NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_DeviceRegistrations] PRIMARY KEY ([Id]),
        CONSTRAINT [AK_DeviceRegistrations_Id_UserId] UNIQUE ([Id], [UserId]),
        CONSTRAINT [CK_DeviceRegistrations_Dates] CHECK ([RefreshedAtUtc] >= [RegisteredAtUtc] AND ([RevokedAtUtc] IS NULL OR [RevokedAtUtc] >= [RefreshedAtUtc])),
        CONSTRAINT [CK_DeviceRegistrations_Platform] CHECK ([Platform] IN (1, 2)),
        CONSTRAINT [CK_DeviceRegistrations_ProtectedPushToken_NotBlank] CHECK (LEN(LTRIM(RTRIM([ProtectedPushToken]))) > 0),
        CONSTRAINT [CK_DeviceRegistrations_Provider_NotBlank] CHECK (LEN(LTRIM(RTRIM([Provider]))) > 0),
        CONSTRAINT [CK_DeviceRegistrations_TokenHash] CHECK (LEN([TokenHash]) = 64 AND [TokenHash] NOT LIKE '%[^0-9A-F]%'),
        CONSTRAINT [CK_DeviceRegistrations_Utc] CHECK (([RegisteredAtUtc] IS NULL OR DATEPART(TZOFFSET, [RegisteredAtUtc]) = 0) AND ([RefreshedAtUtc] IS NULL OR DATEPART(TZOFFSET, [RefreshedAtUtc]) = 0) AND ([RevokedAtUtc] IS NULL OR DATEPART(TZOFFSET, [RevokedAtUtc]) = 0)),
        CONSTRAINT [FK_DeviceRegistrations_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [establishments].[Establishments] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [ContactName] nvarchar(200) NOT NULL,
        [ContactEmail] nvarchar(320) NOT NULL,
        [ContactPhone] nvarchar(32) NOT NULL,
        [Address] nvarchar(500) NOT NULL,
        [Latitude] decimal(9,6) NOT NULL,
        [Longitude] decimal(9,6) NOT NULL,
        [TimeZoneId] nvarchar(100) NOT NULL,
        [Status] int NOT NULL,
        [CreatedByUserId] uniqueidentifier NOT NULL,
        [CreatedAtUtc] datetimeoffset(3) NOT NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_Establishments] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Establishments_Address_NotBlank] CHECK (LEN(LTRIM(RTRIM([Address]))) > 0),
        CONSTRAINT [CK_Establishments_ContactEmail_NotBlank] CHECK (LEN(LTRIM(RTRIM([ContactEmail]))) > 0),
        CONSTRAINT [CK_Establishments_ContactName_NotBlank] CHECK (LEN(LTRIM(RTRIM([ContactName]))) > 0),
        CONSTRAINT [CK_Establishments_ContactPhone_NotBlank] CHECK (LEN(LTRIM(RTRIM([ContactPhone]))) > 0),
        CONSTRAINT [CK_Establishments_Coordinates] CHECK ([Latitude] BETWEEN -90 AND 90 AND [Longitude] BETWEEN -180 AND 180),
        CONSTRAINT [CK_Establishments_Name_NotBlank] CHECK (LEN(LTRIM(RTRIM([Name]))) > 0),
        CONSTRAINT [CK_Establishments_Status] CHECK ([Status] IN (1, 2, 3)),
        CONSTRAINT [CK_Establishments_TimeZoneId_NotBlank] CHECK (LEN(LTRIM(RTRIM([TimeZoneId]))) > 0),
        CONSTRAINT [CK_Establishments_Utc] CHECK (([CreatedAtUtc] IS NULL OR DATEPART(TZOFFSET, [CreatedAtUtc]) = 0)),
        CONSTRAINT [FK_Establishments_Users_CreatedByUserId] FOREIGN KEY ([CreatedByUserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [donations].[Organizations] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [ContactName] nvarchar(200) NOT NULL,
        [ContactEmail] nvarchar(320) NOT NULL,
        [ContactPhone] nvarchar(32) NOT NULL,
        [Address] nvarchar(500) NOT NULL,
        [VerificationInformation] nvarchar(4000) NULL,
        [VerificationStatus] int NOT NULL,
        [CreatedByUserId] uniqueidentifier NOT NULL,
        [CreatedAtUtc] datetimeoffset(3) NOT NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_Organizations] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Organizations_Address_NotBlank] CHECK (LEN(LTRIM(RTRIM([Address]))) > 0),
        CONSTRAINT [CK_Organizations_ContactEmail_NotBlank] CHECK (LEN(LTRIM(RTRIM([ContactEmail]))) > 0),
        CONSTRAINT [CK_Organizations_ContactName_NotBlank] CHECK (LEN(LTRIM(RTRIM([ContactName]))) > 0),
        CONSTRAINT [CK_Organizations_ContactPhone_NotBlank] CHECK (LEN(LTRIM(RTRIM([ContactPhone]))) > 0),
        CONSTRAINT [CK_Organizations_Name_NotBlank] CHECK (LEN(LTRIM(RTRIM([Name]))) > 0),
        CONSTRAINT [CK_Organizations_Utc] CHECK (([CreatedAtUtc] IS NULL OR DATEPART(TZOFFSET, [CreatedAtUtc]) = 0)),
        CONSTRAINT [CK_Organizations_VerificationStatus] CHECK ([VerificationStatus] IN (1, 2, 3, 4)),
        CONSTRAINT [FK_Organizations_Users_CreatedByUserId] FOREIGN KEY ([CreatedByUserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [identity].[AccountStatusChanges] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [FromStatus] int NULL,
        [ToStatus] int NOT NULL,
        [ActorUserId] uniqueidentifier NOT NULL,
        [Reason] nvarchar(1000) NOT NULL,
        [OccurredAtUtc] datetimeoffset(3) NOT NULL,
        CONSTRAINT [PK_AccountStatusChanges] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_AccountStatusChanges_Reason_NotBlank] CHECK (LEN(LTRIM(RTRIM([Reason]))) > 0),
        CONSTRAINT [CK_AccountStatusChanges_Transition] CHECK (([FromStatus] IS NULL AND [ToStatus] = 1) OR ([FromStatus] IS NOT NULL AND (([FromStatus] = 1 AND [ToStatus] = 2) OR ([FromStatus] = 2 AND [ToStatus] = 1)))),
        CONSTRAINT [CK_AccountStatusChanges_Utc] CHECK (([OccurredAtUtc] IS NULL OR DATEPART(TZOFFSET, [OccurredAtUtc]) = 0)),
        CONSTRAINT [FK_AccountStatusChanges_AccountProfiles_UserId] FOREIGN KEY ([UserId]) REFERENCES [identity].[AccountProfiles] ([UserId]),
        CONSTRAINT [FK_AccountStatusChanges_Users_ActorUserId] FOREIGN KEY ([ActorUserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [establishments].[EstablishmentMembers] (
        [Id] uniqueidentifier NOT NULL,
        [EstablishmentId] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [Role] int NOT NULL,
        [IsPrimary] bit NOT NULL,
        [JoinedAtUtc] datetimeoffset(3) NOT NULL,
        [RevokedAtUtc] datetimeoffset(3) NULL,
        [GrantedByUserId] uniqueidentifier NOT NULL,
        [RevokedByUserId] uniqueidentifier NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_EstablishmentMembers] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_EstablishmentMembers_Revocation] CHECK (([RevokedAtUtc] IS NULL AND [RevokedByUserId] IS NULL) OR ([RevokedAtUtc] IS NOT NULL AND [RevokedByUserId] IS NOT NULL AND [RevokedAtUtc] >= [JoinedAtUtc])),
        CONSTRAINT [CK_EstablishmentMembers_Role] CHECK ([Role] IN (1, 2)),
        CONSTRAINT [CK_EstablishmentMembers_Utc] CHECK (([JoinedAtUtc] IS NULL OR DATEPART(TZOFFSET, [JoinedAtUtc]) = 0) AND ([RevokedAtUtc] IS NULL OR DATEPART(TZOFFSET, [RevokedAtUtc]) = 0)),
        CONSTRAINT [FK_EstablishmentMembers_Establishments_EstablishmentId] FOREIGN KEY ([EstablishmentId]) REFERENCES [establishments].[Establishments] ([Id]),
        CONSTRAINT [FK_EstablishmentMembers_Users_GrantedByUserId] FOREIGN KEY ([GrantedByUserId]) REFERENCES [identity].[Users] ([Id]),
        CONSTRAINT [FK_EstablishmentMembers_Users_RevokedByUserId] FOREIGN KEY ([RevokedByUserId]) REFERENCES [identity].[Users] ([Id]),
        CONSTRAINT [FK_EstablishmentMembers_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [establishments].[EstablishmentStatusChanges] (
        [Id] uniqueidentifier NOT NULL,
        [EstablishmentId] uniqueidentifier NOT NULL,
        [FromStatus] int NULL,
        [ToStatus] int NOT NULL,
        [ActorUserId] uniqueidentifier NOT NULL,
        [Reason] nvarchar(1000) NOT NULL,
        [OccurredAtUtc] datetimeoffset(3) NOT NULL,
        CONSTRAINT [PK_EstablishmentStatusChanges] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_EstablishmentStatusChanges_Reason_NotBlank] CHECK (LEN(LTRIM(RTRIM([Reason]))) > 0),
        CONSTRAINT [CK_EstablishmentStatusChanges_Status] CHECK ([ToStatus] IN (1, 2, 3) AND ([FromStatus] IS NULL OR ([FromStatus] IN (1, 2, 3) AND [FromStatus] <> [ToStatus]))),
        CONSTRAINT [CK_EstablishmentStatusChanges_Utc] CHECK (([OccurredAtUtc] IS NULL OR DATEPART(TZOFFSET, [OccurredAtUtc]) = 0)),
        CONSTRAINT [FK_EstablishmentStatusChanges_Establishments_EstablishmentId] FOREIGN KEY ([EstablishmentId]) REFERENCES [establishments].[Establishments] ([Id]),
        CONSTRAINT [FK_EstablishmentStatusChanges_Users_ActorUserId] FOREIGN KEY ([ActorUserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [listings].[Listings] (
        [Id] uniqueidentifier NOT NULL,
        [EstablishmentId] uniqueidentifier NOT NULL,
        [CreatedByUserId] uniqueidentifier NOT NULL,
        [Title] nvarchar(200) NOT NULL,
        [Description] nvarchar(4000) NOT NULL,
        [CategoryId] uniqueidentifier NOT NULL,
        [Mode] int NOT NULL,
        [Status] int NOT NULL,
        [InitialQuantity] int NOT NULL,
        [AddedQuantity] int NOT NULL,
        [TransferredInQuantity] int NOT NULL,
        [TransferredOutQuantity] int NOT NULL,
        [AvailableQuantity] int NOT NULL,
        [AssignedQuantity] int NOT NULL,
        [FulfilledQuantity] int NOT NULL,
        [WrittenOffQuantity] int NOT NULL,
        [OriginalUnitPrice] decimal(18,2) NULL,
        [DiscountedUnitPrice] decimal(18,2) NULL,
        [Currency] char(3) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [PickupInstructions] nvarchar(2000) NOT NULL,
        [PaymentInstructions] nvarchar(1000) NULL,
        [FoodSafetyDeclared] bit NOT NULL,
        [IsFoodFit] bit NOT NULL,
        [PickupStartsAtUtc] datetimeoffset(3) NOT NULL,
        [PickupDeadlineUtc] datetimeoffset(3) NOT NULL,
        [CreatedAtUtc] datetimeoffset(3) NOT NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_Listings] PRIMARY KEY ([Id]),
        CONSTRAINT [AK_Listings_Id_EstablishmentId_Mode] UNIQUE ([Id], [EstablishmentId], [Mode]),
        CONSTRAINT [AK_Listings_Id_Mode] UNIQUE ([Id], [Mode]),
        CONSTRAINT [CK_Listings_Currency] CHECK ([Currency] = 'DOP'),
        CONSTRAINT [CK_Listings_Description_NotBlank] CHECK (LEN(LTRIM(RTRIM([Description]))) > 0),
        CONSTRAINT [CK_Listings_FoodSafety] CHECK ([FoodSafetyDeclared] = 1),
        CONSTRAINT [CK_Listings_Mode] CHECK ([Mode] IN (1, 2)),
        CONSTRAINT [CK_Listings_Payment] CHECK (([Mode] = 1 AND [PaymentInstructions] IS NOT NULL AND LEN(LTRIM(RTRIM([PaymentInstructions]))) > 0) OR ([Mode] = 2 AND [PaymentInstructions] IS NULL)),
        CONSTRAINT [CK_Listings_PickupInstructions_NotBlank] CHECK (LEN(LTRIM(RTRIM([PickupInstructions]))) > 0),
        CONSTRAINT [CK_Listings_Prices] CHECK (([Mode] = 1 AND [OriginalUnitPrice] IS NOT NULL AND [DiscountedUnitPrice] IS NOT NULL AND [OriginalUnitPrice] > 0 AND [DiscountedUnitPrice] > 0 AND [DiscountedUnitPrice] < [OriginalUnitPrice]) OR ([Mode] = 2 AND [OriginalUnitPrice] IS NULL AND [DiscountedUnitPrice] IS NULL)),
        CONSTRAINT [CK_Listings_Quantities] CHECK ([InitialQuantity] >= 0 AND [AddedQuantity] >= 0 AND [TransferredInQuantity] >= 0 AND [TransferredOutQuantity] >= 0 AND CAST([InitialQuantity] AS bigint) + [TransferredInQuantity] > 0 AND [AvailableQuantity] >= 0 AND [AssignedQuantity] >= 0 AND [FulfilledQuantity] >= 0 AND [WrittenOffQuantity] >= 0),
        CONSTRAINT [CK_Listings_Status] CHECK ([Status] IN (1, 2, 3, 4) AND ([Status] <> 2 OR [AvailableQuantity] = 0)),
        CONSTRAINT [CK_Listings_StockBalance] CHECK (CAST([InitialQuantity] AS bigint) + [AddedQuantity] + [TransferredInQuantity] = CAST([AvailableQuantity] AS bigint) + [AssignedQuantity] + [FulfilledQuantity] + [WrittenOffQuantity] + [TransferredOutQuantity]),
        CONSTRAINT [CK_Listings_Title_NotBlank] CHECK (LEN(LTRIM(RTRIM([Title]))) > 0),
        CONSTRAINT [CK_Listings_Utc] CHECK (([PickupStartsAtUtc] IS NULL OR DATEPART(TZOFFSET, [PickupStartsAtUtc]) = 0) AND ([PickupDeadlineUtc] IS NULL OR DATEPART(TZOFFSET, [PickupDeadlineUtc]) = 0) AND ([CreatedAtUtc] IS NULL OR DATEPART(TZOFFSET, [CreatedAtUtc]) = 0)),
        CONSTRAINT [CK_Listings_Window] CHECK ([PickupStartsAtUtc] < [PickupDeadlineUtc] AND [CreatedAtUtc] < [PickupDeadlineUtc]),
        CONSTRAINT [FK_Listings_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [listings].[Categories] ([Id]),
        CONSTRAINT [FK_Listings_Establishments_EstablishmentId] FOREIGN KEY ([EstablishmentId]) REFERENCES [establishments].[Establishments] ([Id]),
        CONSTRAINT [FK_Listings_Users_CreatedByUserId] FOREIGN KEY ([CreatedByUserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [donations].[OrganizationMembers] (
        [Id] uniqueidentifier NOT NULL,
        [OrganizationId] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [Role] int NOT NULL,
        [IsPrimary] bit NOT NULL,
        [JoinedAtUtc] datetimeoffset(3) NOT NULL,
        [RevokedAtUtc] datetimeoffset(3) NULL,
        [GrantedByUserId] uniqueidentifier NOT NULL,
        [RevokedByUserId] uniqueidentifier NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_OrganizationMembers] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_OrganizationMembers_Revocation] CHECK (([RevokedAtUtc] IS NULL AND [RevokedByUserId] IS NULL) OR ([RevokedAtUtc] IS NOT NULL AND [RevokedByUserId] IS NOT NULL AND [RevokedAtUtc] >= [JoinedAtUtc])),
        CONSTRAINT [CK_OrganizationMembers_Role] CHECK ([Role] IN (1, 2)),
        CONSTRAINT [CK_OrganizationMembers_Utc] CHECK (([JoinedAtUtc] IS NULL OR DATEPART(TZOFFSET, [JoinedAtUtc]) = 0) AND ([RevokedAtUtc] IS NULL OR DATEPART(TZOFFSET, [RevokedAtUtc]) = 0)),
        CONSTRAINT [FK_OrganizationMembers_Organizations_OrganizationId] FOREIGN KEY ([OrganizationId]) REFERENCES [donations].[Organizations] ([Id]),
        CONSTRAINT [FK_OrganizationMembers_Users_GrantedByUserId] FOREIGN KEY ([GrantedByUserId]) REFERENCES [identity].[Users] ([Id]),
        CONSTRAINT [FK_OrganizationMembers_Users_RevokedByUserId] FOREIGN KEY ([RevokedByUserId]) REFERENCES [identity].[Users] ([Id]),
        CONSTRAINT [FK_OrganizationMembers_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [donations].[OrganizationReviews] (
        [Id] uniqueidentifier NOT NULL,
        [OrganizationId] uniqueidentifier NOT NULL,
        [FromStatus] int NOT NULL,
        [ToStatus] int NOT NULL,
        [ReviewerUserId] uniqueidentifier NOT NULL,
        [Reason] nvarchar(1000) NOT NULL,
        [NameSnapshot] nvarchar(200) NOT NULL,
        [ContactNameSnapshot] nvarchar(200) NOT NULL,
        [ContactEmailSnapshot] nvarchar(320) NOT NULL,
        [ContactPhoneSnapshot] nvarchar(32) NOT NULL,
        [AddressSnapshot] nvarchar(500) NOT NULL,
        [VerificationInformationSnapshot] nvarchar(4000) NULL,
        [ReviewedAtUtc] datetimeoffset(3) NOT NULL,
        CONSTRAINT [PK_OrganizationReviews] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_OrganizationReviews_AddressSnapshot_NotBlank] CHECK (LEN(LTRIM(RTRIM([AddressSnapshot]))) > 0),
        CONSTRAINT [CK_OrganizationReviews_ContactEmailSnapshot_NotBlank] CHECK (LEN(LTRIM(RTRIM([ContactEmailSnapshot]))) > 0),
        CONSTRAINT [CK_OrganizationReviews_ContactNameSnapshot_NotBlank] CHECK (LEN(LTRIM(RTRIM([ContactNameSnapshot]))) > 0),
        CONSTRAINT [CK_OrganizationReviews_ContactPhoneSnapshot_NotBlank] CHECK (LEN(LTRIM(RTRIM([ContactPhoneSnapshot]))) > 0),
        CONSTRAINT [CK_OrganizationReviews_NameSnapshot_NotBlank] CHECK (LEN(LTRIM(RTRIM([NameSnapshot]))) > 0),
        CONSTRAINT [CK_OrganizationReviews_Reason_NotBlank] CHECK (LEN(LTRIM(RTRIM([Reason]))) > 0),
        CONSTRAINT [CK_OrganizationReviews_Status] CHECK ([FromStatus] IN (1, 2, 3, 4) AND [ToStatus] IN (2, 3, 4)),
        CONSTRAINT [CK_OrganizationReviews_Utc] CHECK (([ReviewedAtUtc] IS NULL OR DATEPART(TZOFFSET, [ReviewedAtUtc]) = 0)),
        CONSTRAINT [FK_OrganizationReviews_Organizations_OrganizationId] FOREIGN KEY ([OrganizationId]) REFERENCES [donations].[Organizations] ([Id]),
        CONSTRAINT [FK_OrganizationReviews_Users_ReviewerUserId] FOREIGN KEY ([ReviewerUserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [donations].[DonationAcceptances] (
        [Id] uniqueidentifier NOT NULL,
        [ListingId] uniqueidentifier NOT NULL,
        [OrganizationId] uniqueidentifier NOT NULL,
        [AcceptedByUserId] uniqueidentifier NOT NULL,
        [Quantity] int NOT NULL,
        [ListingTitleSnapshot] nvarchar(200) NOT NULL,
        [PickupAddressSnapshot] nvarchar(500) NOT NULL,
        [PickupInstructionsSnapshot] nvarchar(2000) NOT NULL,
        [TimeZoneIdSnapshot] nvarchar(100) NOT NULL,
        [PickupStartsAtUtc] datetimeoffset(3) NOT NULL,
        [PickupDeadlineUtc] datetimeoffset(3) NOT NULL,
        [IdempotencyKey] varchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [RequestHash] char(64) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [Status] int NOT NULL,
        [CreatedAtUtc] datetimeoffset(3) NOT NULL,
        [ClosedAtUtc] datetimeoffset(3) NULL,
        [RowVersion] rowversion NOT NULL,
        [ListingMode] int NOT NULL DEFAULT 2,
        CONSTRAINT [PK_DonationAcceptances] PRIMARY KEY ([Id]),
        CONSTRAINT [AK_DonationAcceptances_Id_ListingId] UNIQUE ([Id], [ListingId]),
        CONSTRAINT [CK_DonationAcceptances_Closed] CHECK (([Status] = 1 AND [ClosedAtUtc] IS NULL) OR ([Status] IN (2, 3, 4) AND [ClosedAtUtc] IS NOT NULL AND [ClosedAtUtc] >= [CreatedAtUtc])),
        CONSTRAINT [CK_DonationAcceptances_DonationOnly] CHECK ([ListingMode] = 2),
        CONSTRAINT [CK_DonationAcceptances_IdempotencyKey] CHECK (LEN([IdempotencyKey]) > 0 AND DATALENGTH([IdempotencyKey]) = DATALENGTH(LTRIM(RTRIM([IdempotencyKey])))),
        CONSTRAINT [CK_DonationAcceptances_ListingTitleSnapshot_NotBlank] CHECK (LEN(LTRIM(RTRIM([ListingTitleSnapshot]))) > 0),
        CONSTRAINT [CK_DonationAcceptances_PickupAddressSnapshot_NotBlank] CHECK (LEN(LTRIM(RTRIM([PickupAddressSnapshot]))) > 0),
        CONSTRAINT [CK_DonationAcceptances_PickupInstructionsSnapshot_NotBlank] CHECK (LEN(LTRIM(RTRIM([PickupInstructionsSnapshot]))) > 0),
        CONSTRAINT [CK_DonationAcceptances_Quantity] CHECK ([Quantity] > 0),
        CONSTRAINT [CK_DonationAcceptances_RequestHash] CHECK (LEN([RequestHash]) = 64 AND [RequestHash] NOT LIKE '%[^0-9A-F]%'),
        CONSTRAINT [CK_DonationAcceptances_Status] CHECK ([Status] IN (1, 2, 3, 4)),
        CONSTRAINT [CK_DonationAcceptances_TimeZoneIdSnapshot_NotBlank] CHECK (LEN(LTRIM(RTRIM([TimeZoneIdSnapshot]))) > 0),
        CONSTRAINT [CK_DonationAcceptances_Utc] CHECK (([PickupStartsAtUtc] IS NULL OR DATEPART(TZOFFSET, [PickupStartsAtUtc]) = 0) AND ([PickupDeadlineUtc] IS NULL OR DATEPART(TZOFFSET, [PickupDeadlineUtc]) = 0) AND ([CreatedAtUtc] IS NULL OR DATEPART(TZOFFSET, [CreatedAtUtc]) = 0) AND ([ClosedAtUtc] IS NULL OR DATEPART(TZOFFSET, [ClosedAtUtc]) = 0)),
        CONSTRAINT [CK_DonationAcceptances_Window] CHECK ([PickupStartsAtUtc] < [PickupDeadlineUtc] AND [CreatedAtUtc] < [PickupDeadlineUtc]),
        CONSTRAINT [FK_DonationAcceptances_Listings_ListingId_ListingMode] FOREIGN KEY ([ListingId], [ListingMode]) REFERENCES [listings].[Listings] ([Id], [Mode]),
        CONSTRAINT [FK_DonationAcceptances_Organizations_OrganizationId] FOREIGN KEY ([OrganizationId]) REFERENCES [donations].[Organizations] ([Id]),
        CONSTRAINT [FK_DonationAcceptances_Users_AcceptedByUserId] FOREIGN KEY ([AcceptedByUserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [notifications].[ListingExpiryAlerts] (
        [Id] uniqueidentifier NOT NULL,
        [ListingId] uniqueidentifier NOT NULL,
        [ThresholdMinutes] int NOT NULL,
        [AvailableQuantitySnapshot] int NOT NULL,
        [DeadlineSnapshotUtc] datetimeoffset(3) NOT NULL,
        [CreatedAtUtc] datetimeoffset(3) NOT NULL,
        CONSTRAINT [PK_ListingExpiryAlerts] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_ListingExpiryAlerts_Deadline] CHECK ([CreatedAtUtc] < [DeadlineSnapshotUtc]),
        CONSTRAINT [CK_ListingExpiryAlerts_Quantity] CHECK ([AvailableQuantitySnapshot] > 0),
        CONSTRAINT [CK_ListingExpiryAlerts_Threshold] CHECK ([ThresholdMinutes] > 0),
        CONSTRAINT [CK_ListingExpiryAlerts_Utc] CHECK (([DeadlineSnapshotUtc] IS NULL OR DATEPART(TZOFFSET, [DeadlineSnapshotUtc]) = 0) AND ([CreatedAtUtc] IS NULL OR DATEPART(TZOFFSET, [CreatedAtUtc]) = 0)),
        CONSTRAINT [FK_ListingExpiryAlerts_Listings_ListingId] FOREIGN KEY ([ListingId]) REFERENCES [listings].[Listings] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [listings].[ListingFitnessChanges] (
        [Id] uniqueidentifier NOT NULL,
        [ListingId] uniqueidentifier NOT NULL,
        [FromIsFoodFit] bit NOT NULL,
        [ToIsFoodFit] bit NOT NULL,
        [ActorUserId] uniqueidentifier NOT NULL,
        [Reason] nvarchar(1000) NOT NULL,
        [OccurredAtUtc] datetimeoffset(3) NOT NULL,
        CONSTRAINT [PK_ListingFitnessChanges] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_ListingFitnessChanges_Changed] CHECK ([FromIsFoodFit] <> [ToIsFoodFit]),
        CONSTRAINT [CK_ListingFitnessChanges_Reason_NotBlank] CHECK (LEN(LTRIM(RTRIM([Reason]))) > 0),
        CONSTRAINT [CK_ListingFitnessChanges_Utc] CHECK (([OccurredAtUtc] IS NULL OR DATEPART(TZOFFSET, [OccurredAtUtc]) = 0)),
        CONSTRAINT [FK_ListingFitnessChanges_Listings_ListingId] FOREIGN KEY ([ListingId]) REFERENCES [listings].[Listings] ([Id]),
        CONSTRAINT [FK_ListingFitnessChanges_Users_ActorUserId] FOREIGN KEY ([ActorUserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [listings].[ListingStatusChanges] (
        [Id] uniqueidentifier NOT NULL,
        [ListingId] uniqueidentifier NOT NULL,
        [FromStatus] int NULL,
        [ToStatus] int NOT NULL,
        [ActorUserId] uniqueidentifier NULL,
        [Reason] nvarchar(1000) NOT NULL,
        [OccurredAtUtc] datetimeoffset(3) NOT NULL,
        CONSTRAINT [PK_ListingStatusChanges] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_ListingStatusChanges_Actor] CHECK ([ActorUserId] IS NOT NULL OR [ToStatus] IN (1, 2, 4)),
        CONSTRAINT [CK_ListingStatusChanges_Reason_NotBlank] CHECK (LEN(LTRIM(RTRIM([Reason]))) > 0),
        CONSTRAINT [CK_ListingStatusChanges_Transition] CHECK (([FromStatus] IS NULL AND [ToStatus] = 1) OR ([FromStatus] IS NOT NULL AND (([FromStatus] = 1 AND [ToStatus] IN (2, 3, 4)) OR ([FromStatus] = 2 AND [ToStatus] IN (1, 3, 4))))),
        CONSTRAINT [CK_ListingStatusChanges_Utc] CHECK (([OccurredAtUtc] IS NULL OR DATEPART(TZOFFSET, [OccurredAtUtc]) = 0)),
        CONSTRAINT [FK_ListingStatusChanges_Listings_ListingId] FOREIGN KEY ([ListingId]) REFERENCES [listings].[Listings] ([Id]),
        CONSTRAINT [FK_ListingStatusChanges_Users_ActorUserId] FOREIGN KEY ([ActorUserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [reservations].[Reservations] (
        [Id] uniqueidentifier NOT NULL,
        [ListingId] uniqueidentifier NOT NULL,
        [ConsumerUserId] uniqueidentifier NOT NULL,
        [Quantity] int NOT NULL,
        [UnitPrice] decimal(18,2) NOT NULL,
        [Currency] char(3) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [ListingTitleSnapshot] nvarchar(200) NOT NULL,
        [PickupAddressSnapshot] nvarchar(500) NOT NULL,
        [PickupInstructionsSnapshot] nvarchar(2000) NOT NULL,
        [PaymentInstructionsSnapshot] nvarchar(1000) NOT NULL,
        [TimeZoneIdSnapshot] nvarchar(100) NOT NULL,
        [PickupStartsAtUtc] datetimeoffset(3) NOT NULL,
        [PickupDeadlineUtc] datetimeoffset(3) NOT NULL,
        [PickupReference] varchar(32) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [IdempotencyKey] varchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [RequestHash] char(64) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [Status] int NOT NULL,
        [CreatedAtUtc] datetimeoffset(3) NOT NULL,
        [ClosedAtUtc] datetimeoffset(3) NULL,
        [RowVersion] rowversion NOT NULL,
        [ListingMode] int NOT NULL DEFAULT 1,
        CONSTRAINT [PK_Reservations] PRIMARY KEY ([Id]),
        CONSTRAINT [AK_Reservations_Id_ListingId] UNIQUE ([Id], [ListingId]),
        CONSTRAINT [CK_Reservations_Closed] CHECK (([Status] = 1 AND [ClosedAtUtc] IS NULL) OR ([Status] IN (2, 3, 4) AND [ClosedAtUtc] IS NOT NULL AND [ClosedAtUtc] >= [CreatedAtUtc])),
        CONSTRAINT [CK_Reservations_IdempotencyKey] CHECK (LEN([IdempotencyKey]) > 0 AND DATALENGTH([IdempotencyKey]) = DATALENGTH(LTRIM(RTRIM([IdempotencyKey])))),
        CONSTRAINT [CK_Reservations_ListingTitleSnapshot_NotBlank] CHECK (LEN(LTRIM(RTRIM([ListingTitleSnapshot]))) > 0),
        CONSTRAINT [CK_Reservations_PaymentInstructionsSnapshot_NotBlank] CHECK (LEN(LTRIM(RTRIM([PaymentInstructionsSnapshot]))) > 0),
        CONSTRAINT [CK_Reservations_PickupAddressSnapshot_NotBlank] CHECK (LEN(LTRIM(RTRIM([PickupAddressSnapshot]))) > 0),
        CONSTRAINT [CK_Reservations_PickupInstructionsSnapshot_NotBlank] CHECK (LEN(LTRIM(RTRIM([PickupInstructionsSnapshot]))) > 0),
        CONSTRAINT [CK_Reservations_PickupReference_NotBlank] CHECK (LEN(LTRIM(RTRIM([PickupReference]))) > 0),
        CONSTRAINT [CK_Reservations_Price] CHECK ([UnitPrice] > 0 AND [Currency] = 'DOP'),
        CONSTRAINT [CK_Reservations_Quantity] CHECK ([Quantity] > 0),
        CONSTRAINT [CK_Reservations_RequestHash] CHECK (LEN([RequestHash]) = 64 AND [RequestHash] NOT LIKE '%[^0-9A-F]%'),
        CONSTRAINT [CK_Reservations_SaleOnly] CHECK ([ListingMode] = 1),
        CONSTRAINT [CK_Reservations_Status] CHECK ([Status] IN (1, 2, 3, 4)),
        CONSTRAINT [CK_Reservations_TimeZoneIdSnapshot_NotBlank] CHECK (LEN(LTRIM(RTRIM([TimeZoneIdSnapshot]))) > 0),
        CONSTRAINT [CK_Reservations_Utc] CHECK (([PickupStartsAtUtc] IS NULL OR DATEPART(TZOFFSET, [PickupStartsAtUtc]) = 0) AND ([PickupDeadlineUtc] IS NULL OR DATEPART(TZOFFSET, [PickupDeadlineUtc]) = 0) AND ([CreatedAtUtc] IS NULL OR DATEPART(TZOFFSET, [CreatedAtUtc]) = 0) AND ([ClosedAtUtc] IS NULL OR DATEPART(TZOFFSET, [ClosedAtUtc]) = 0)),
        CONSTRAINT [CK_Reservations_Window] CHECK ([PickupStartsAtUtc] < [PickupDeadlineUtc] AND [CreatedAtUtc] < [PickupDeadlineUtc]),
        CONSTRAINT [FK_Reservations_Listings_ListingId_ListingMode] FOREIGN KEY ([ListingId], [ListingMode]) REFERENCES [listings].[Listings] ([Id], [Mode]),
        CONSTRAINT [FK_Reservations_Users_ConsumerUserId] FOREIGN KEY ([ConsumerUserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [listings].[StockTransfers] (
        [Id] uniqueidentifier NOT NULL,
        [EstablishmentId] uniqueidentifier NOT NULL,
        [SourceListingId] uniqueidentifier NOT NULL,
        [SourceMode] int NOT NULL,
        [DestinationListingId] uniqueidentifier NOT NULL,
        [DestinationMode] int NOT NULL,
        [Quantity] int NOT NULL,
        [ActorUserId] uniqueidentifier NOT NULL,
        [Reason] nvarchar(1000) NOT NULL,
        [OccurredAtUtc] datetimeoffset(3) NOT NULL,
        CONSTRAINT [PK_StockTransfers] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_StockTransfers_DifferentListings] CHECK ([SourceListingId] <> [DestinationListingId]),
        CONSTRAINT [CK_StockTransfers_Modes] CHECK ([SourceMode] IN (1, 2) AND [DestinationMode] IN (1, 2)),
        CONSTRAINT [CK_StockTransfers_Quantity] CHECK ([Quantity] > 0),
        CONSTRAINT [CK_StockTransfers_Reason_NotBlank] CHECK (LEN(LTRIM(RTRIM([Reason]))) > 0),
        CONSTRAINT [CK_StockTransfers_Utc] CHECK (([OccurredAtUtc] IS NULL OR DATEPART(TZOFFSET, [OccurredAtUtc]) = 0)),
        CONSTRAINT [FK_StockTransfers_Listings_DestinationListingId_EstablishmentId_DestinationMode] FOREIGN KEY ([DestinationListingId], [EstablishmentId], [DestinationMode]) REFERENCES [listings].[Listings] ([Id], [EstablishmentId], [Mode]),
        CONSTRAINT [FK_StockTransfers_Listings_SourceListingId_EstablishmentId_SourceMode] FOREIGN KEY ([SourceListingId], [EstablishmentId], [SourceMode]) REFERENCES [listings].[Listings] ([Id], [EstablishmentId], [Mode]),
        CONSTRAINT [FK_StockTransfers_Users_ActorUserId] FOREIGN KEY ([ActorUserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [donations].[DonationAcceptanceStatusChanges] (
        [Id] uniqueidentifier NOT NULL,
        [DonationAcceptanceId] uniqueidentifier NOT NULL,
        [FromStatus] int NULL,
        [ToStatus] int NOT NULL,
        [ActorUserId] uniqueidentifier NULL,
        [Reason] nvarchar(1000) NOT NULL,
        [OccurredAtUtc] datetimeoffset(3) NOT NULL,
        CONSTRAINT [PK_DonationAcceptanceStatusChanges] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_DonationAcceptanceStatusChanges_Actor] CHECK ([ActorUserId] IS NOT NULL OR [ToStatus] = 4),
        CONSTRAINT [CK_DonationAcceptanceStatusChanges_Reason_NotBlank] CHECK (LEN(LTRIM(RTRIM([Reason]))) > 0),
        CONSTRAINT [CK_DonationAcceptanceStatusChanges_Transition] CHECK (([FromStatus] IS NULL AND [ToStatus] = 1) OR ([FromStatus] IS NOT NULL AND [FromStatus] = 1 AND [ToStatus] IN (2, 3, 4))),
        CONSTRAINT [CK_DonationAcceptanceStatusChanges_Utc] CHECK (([OccurredAtUtc] IS NULL OR DATEPART(TZOFFSET, [OccurredAtUtc]) = 0)),
        CONSTRAINT [FK_DonationAcceptanceStatusChanges_DonationAcceptances_DonationAcceptanceId] FOREIGN KEY ([DonationAcceptanceId]) REFERENCES [donations].[DonationAcceptances] ([Id]),
        CONSTRAINT [FK_DonationAcceptanceStatusChanges_Users_ActorUserId] FOREIGN KEY ([ActorUserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [donations].[DonationHandovers] (
        [DonationAcceptanceId] uniqueidentifier NOT NULL,
        [ConfirmedByUserId] uniqueidentifier NOT NULL,
        [HandedOverAtUtc] datetimeoffset(3) NOT NULL,
        [Notes] nvarchar(1000) NULL,
        CONSTRAINT [PK_DonationHandovers] PRIMARY KEY ([DonationAcceptanceId]),
        CONSTRAINT [CK_DonationHandovers_Utc] CHECK (([HandedOverAtUtc] IS NULL OR DATEPART(TZOFFSET, [HandedOverAtUtc]) = 0)),
        CONSTRAINT [FK_DonationHandovers_DonationAcceptances_DonationAcceptanceId] FOREIGN KEY ([DonationAcceptanceId]) REFERENCES [donations].[DonationAcceptances] ([Id]),
        CONSTRAINT [FK_DonationHandovers_Users_ConfirmedByUserId] FOREIGN KEY ([ConfirmedByUserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [donations].[DonationReceipts] (
        [DonationAcceptanceId] uniqueidentifier NOT NULL,
        [ReceivedByUserId] uniqueidentifier NOT NULL,
        [ReceivedAtUtc] datetimeoffset(3) NOT NULL,
        [Notes] nvarchar(1000) NULL,
        CONSTRAINT [PK_DonationReceipts] PRIMARY KEY ([DonationAcceptanceId]),
        CONSTRAINT [CK_DonationReceipts_Utc] CHECK (([ReceivedAtUtc] IS NULL OR DATEPART(TZOFFSET, [ReceivedAtUtc]) = 0)),
        CONSTRAINT [FK_DonationReceipts_DonationAcceptances_DonationAcceptanceId] FOREIGN KEY ([DonationAcceptanceId]) REFERENCES [donations].[DonationAcceptances] ([Id]),
        CONSTRAINT [FK_DonationReceipts_Users_ReceivedByUserId] FOREIGN KEY ([ReceivedByUserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [administration].[Incidents] (
        [Id] uniqueidentifier NOT NULL,
        [ReporterUserId] uniqueidentifier NOT NULL,
        [AssignedToUserId] uniqueidentifier NULL,
        [ListingId] uniqueidentifier NULL,
        [ReservationId] uniqueidentifier NULL,
        [DonationAcceptanceId] uniqueidentifier NULL,
        [Kind] int NOT NULL,
        [ActualQuantity] int NULL,
        [ObservedAtUtc] datetimeoffset(3) NULL,
        [Title] nvarchar(200) NOT NULL,
        [Description] nvarchar(4000) NOT NULL,
        [Status] int NOT NULL,
        [CreatedAtUtc] datetimeoffset(3) NOT NULL,
        [ClosedAtUtc] datetimeoffset(3) NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_Incidents] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Incidents_Closed] CHECK (([Status] IN (1, 2) AND [ClosedAtUtc] IS NULL) OR ([Status] IN (3, 4) AND [ClosedAtUtc] IS NOT NULL AND [ClosedAtUtc] >= [CreatedAtUtc])),
        CONSTRAINT [CK_Incidents_Description_NotBlank] CHECK (LEN(LTRIM(RTRIM([Description]))) > 0),
        CONSTRAINT [CK_Incidents_Kind] CHECK ([Kind] IN (1, 2, 3)),
        CONSTRAINT [CK_Incidents_Observation] CHECK ([ObservedAtUtc] IS NULL OR [ObservedAtUtc] <= [CreatedAtUtc]),
        CONSTRAINT [CK_Incidents_PickupFacts] CHECK (([Kind] = 1 AND [ActualQuantity] IS NULL) OR ([Kind] = 2 AND [ActualQuantity] IS NOT NULL AND [ActualQuantity] > 0 AND [ObservedAtUtc] IS NOT NULL AND ([ReservationId] IS NOT NULL OR [DonationAcceptanceId] IS NOT NULL)) OR ([Kind] = 3 AND ([ActualQuantity] IS NULL OR [ActualQuantity] >= 0) AND [ObservedAtUtc] IS NOT NULL AND ([ReservationId] IS NOT NULL OR [DonationAcceptanceId] IS NOT NULL))),
        CONSTRAINT [CK_Incidents_Status] CHECK ([Status] IN (1, 2, 3, 4)),
        CONSTRAINT [CK_Incidents_Target] CHECK ((CASE WHEN [ListingId] IS NULL THEN 0 ELSE 1 END + CASE WHEN [ReservationId] IS NULL THEN 0 ELSE 1 END + CASE WHEN [DonationAcceptanceId] IS NULL THEN 0 ELSE 1 END) <= 1),
        CONSTRAINT [CK_Incidents_Title_NotBlank] CHECK (LEN(LTRIM(RTRIM([Title]))) > 0),
        CONSTRAINT [CK_Incidents_Utc] CHECK (([ObservedAtUtc] IS NULL OR DATEPART(TZOFFSET, [ObservedAtUtc]) = 0) AND ([CreatedAtUtc] IS NULL OR DATEPART(TZOFFSET, [CreatedAtUtc]) = 0) AND ([ClosedAtUtc] IS NULL OR DATEPART(TZOFFSET, [ClosedAtUtc]) = 0)),
        CONSTRAINT [FK_Incidents_DonationAcceptances_DonationAcceptanceId] FOREIGN KEY ([DonationAcceptanceId]) REFERENCES [donations].[DonationAcceptances] ([Id]),
        CONSTRAINT [FK_Incidents_Listings_ListingId] FOREIGN KEY ([ListingId]) REFERENCES [listings].[Listings] ([Id]),
        CONSTRAINT [FK_Incidents_Reservations_ReservationId] FOREIGN KEY ([ReservationId]) REFERENCES [reservations].[Reservations] ([Id]),
        CONSTRAINT [FK_Incidents_Users_AssignedToUserId] FOREIGN KEY ([AssignedToUserId]) REFERENCES [identity].[Users] ([Id]),
        CONSTRAINT [FK_Incidents_Users_ReporterUserId] FOREIGN KEY ([ReporterUserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [notifications].[Notifications] (
        [Id] uniqueidentifier NOT NULL,
        [RecipientUserId] uniqueidentifier NOT NULL,
        [Kind] int NOT NULL,
        [EventKey] varchar(128) COLLATE Latin1_General_100_BIN2 NOT NULL,
        [Subject] nvarchar(200) NOT NULL,
        [Body] nvarchar(4000) NOT NULL,
        [ReservationId] uniqueidentifier NULL,
        [DonationAcceptanceId] uniqueidentifier NULL,
        [OrganizationReviewId] uniqueidentifier NULL,
        [ListingExpiryAlertId] uniqueidentifier NULL,
        [CreatedAtUtc] datetimeoffset(3) NOT NULL,
        [ReadAtUtc] datetimeoffset(3) NULL,
        CONSTRAINT [PK_Notifications] PRIMARY KEY ([Id]),
        CONSTRAINT [AK_Notifications_Id_RecipientUserId] UNIQUE ([Id], [RecipientUserId]),
        CONSTRAINT [CK_Notifications_Body_NotBlank] CHECK (LEN(LTRIM(RTRIM([Body]))) > 0),
        CONSTRAINT [CK_Notifications_EventKey_NotBlank] CHECK (LEN(LTRIM(RTRIM([EventKey]))) > 0),
        CONSTRAINT [CK_Notifications_Read] CHECK ([ReadAtUtc] IS NULL OR [ReadAtUtc] >= [CreatedAtUtc]),
        CONSTRAINT [CK_Notifications_Subject_NotBlank] CHECK (LEN(LTRIM(RTRIM([Subject]))) > 0),
        CONSTRAINT [CK_Notifications_Target] CHECK (([Kind] IN (1, 2, 3, 4) AND [ReservationId] IS NOT NULL AND [DonationAcceptanceId] IS NULL AND [OrganizationReviewId] IS NULL AND [ListingExpiryAlertId] IS NULL) OR ([Kind] IN (5, 6, 7, 8) AND [ReservationId] IS NULL AND [DonationAcceptanceId] IS NOT NULL AND [OrganizationReviewId] IS NULL AND [ListingExpiryAlertId] IS NULL) OR ([Kind] = 9 AND [ReservationId] IS NULL AND [DonationAcceptanceId] IS NULL AND [OrganizationReviewId] IS NOT NULL AND [ListingExpiryAlertId] IS NULL) OR ([Kind] = 10 AND [ReservationId] IS NULL AND [DonationAcceptanceId] IS NULL AND [OrganizationReviewId] IS NULL AND [ListingExpiryAlertId] IS NOT NULL)),
        CONSTRAINT [CK_Notifications_Utc] CHECK (([CreatedAtUtc] IS NULL OR DATEPART(TZOFFSET, [CreatedAtUtc]) = 0) AND ([ReadAtUtc] IS NULL OR DATEPART(TZOFFSET, [ReadAtUtc]) = 0)),
        CONSTRAINT [FK_Notifications_DonationAcceptances_DonationAcceptanceId] FOREIGN KEY ([DonationAcceptanceId]) REFERENCES [donations].[DonationAcceptances] ([Id]),
        CONSTRAINT [FK_Notifications_ListingExpiryAlerts_ListingExpiryAlertId] FOREIGN KEY ([ListingExpiryAlertId]) REFERENCES [notifications].[ListingExpiryAlerts] ([Id]),
        CONSTRAINT [FK_Notifications_OrganizationReviews_OrganizationReviewId] FOREIGN KEY ([OrganizationReviewId]) REFERENCES [donations].[OrganizationReviews] ([Id]),
        CONSTRAINT [FK_Notifications_Reservations_ReservationId] FOREIGN KEY ([ReservationId]) REFERENCES [reservations].[Reservations] ([Id]),
        CONSTRAINT [FK_Notifications_Users_RecipientUserId] FOREIGN KEY ([RecipientUserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [reservations].[ReservationDeliveries] (
        [ReservationId] uniqueidentifier NOT NULL,
        [ConfirmedByUserId] uniqueidentifier NOT NULL,
        [DeliveredAtUtc] datetimeoffset(3) NOT NULL,
        [Notes] nvarchar(1000) NULL,
        CONSTRAINT [PK_ReservationDeliveries] PRIMARY KEY ([ReservationId]),
        CONSTRAINT [CK_ReservationDeliveries_Utc] CHECK (([DeliveredAtUtc] IS NULL OR DATEPART(TZOFFSET, [DeliveredAtUtc]) = 0)),
        CONSTRAINT [FK_ReservationDeliveries_Reservations_ReservationId] FOREIGN KEY ([ReservationId]) REFERENCES [reservations].[Reservations] ([Id]),
        CONSTRAINT [FK_ReservationDeliveries_Users_ConfirmedByUserId] FOREIGN KEY ([ConfirmedByUserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [reservations].[ReservationStatusChanges] (
        [Id] uniqueidentifier NOT NULL,
        [ReservationId] uniqueidentifier NOT NULL,
        [FromStatus] int NULL,
        [ToStatus] int NOT NULL,
        [ActorUserId] uniqueidentifier NULL,
        [Reason] nvarchar(1000) NOT NULL,
        [OccurredAtUtc] datetimeoffset(3) NOT NULL,
        CONSTRAINT [PK_ReservationStatusChanges] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_ReservationStatusChanges_Actor] CHECK ([ActorUserId] IS NOT NULL OR [ToStatus] = 4),
        CONSTRAINT [CK_ReservationStatusChanges_Reason_NotBlank] CHECK (LEN(LTRIM(RTRIM([Reason]))) > 0),
        CONSTRAINT [CK_ReservationStatusChanges_Transition] CHECK (([FromStatus] IS NULL AND [ToStatus] = 1) OR ([FromStatus] IS NOT NULL AND [FromStatus] = 1 AND [ToStatus] IN (2, 3, 4))),
        CONSTRAINT [CK_ReservationStatusChanges_Utc] CHECK (([OccurredAtUtc] IS NULL OR DATEPART(TZOFFSET, [OccurredAtUtc]) = 0)),
        CONSTRAINT [FK_ReservationStatusChanges_Reservations_ReservationId] FOREIGN KEY ([ReservationId]) REFERENCES [reservations].[Reservations] ([Id]),
        CONSTRAINT [FK_ReservationStatusChanges_Users_ActorUserId] FOREIGN KEY ([ActorUserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [listings].[StockAdjustments] (
        [Id] uniqueidentifier NOT NULL,
        [ListingId] uniqueidentifier NOT NULL,
        [Kind] int NOT NULL,
        [Quantity] int NOT NULL,
        [ReservationId] uniqueidentifier NULL,
        [DonationAcceptanceId] uniqueidentifier NULL,
        [ActorUserId] uniqueidentifier NULL,
        [Reason] nvarchar(1000) NOT NULL,
        [OccurredAtUtc] datetimeoffset(3) NOT NULL,
        CONSTRAINT [PK_StockAdjustments] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_StockAdjustments_Actor] CHECK ([ActorUserId] IS NOT NULL OR [Kind] = 3),
        CONSTRAINT [CK_StockAdjustments_Kind] CHECK ([Kind] IN (1, 2, 3)),
        CONSTRAINT [CK_StockAdjustments_Operation] CHECK (([ReservationId] IS NULL OR [DonationAcceptanceId] IS NULL) AND ([Kind] <> 1 OR ([ReservationId] IS NULL AND [DonationAcceptanceId] IS NULL))),
        CONSTRAINT [CK_StockAdjustments_Quantity] CHECK ([Quantity] > 0),
        CONSTRAINT [CK_StockAdjustments_Reason_NotBlank] CHECK (LEN(LTRIM(RTRIM([Reason]))) > 0),
        CONSTRAINT [CK_StockAdjustments_Utc] CHECK (([OccurredAtUtc] IS NULL OR DATEPART(TZOFFSET, [OccurredAtUtc]) = 0)),
        CONSTRAINT [FK_StockAdjustments_DonationAcceptances_DonationAcceptanceId_ListingId] FOREIGN KEY ([DonationAcceptanceId], [ListingId]) REFERENCES [donations].[DonationAcceptances] ([Id], [ListingId]),
        CONSTRAINT [FK_StockAdjustments_Listings_ListingId] FOREIGN KEY ([ListingId]) REFERENCES [listings].[Listings] ([Id]),
        CONSTRAINT [FK_StockAdjustments_Reservations_ReservationId_ListingId] FOREIGN KEY ([ReservationId], [ListingId]) REFERENCES [reservations].[Reservations] ([Id], [ListingId]),
        CONSTRAINT [FK_StockAdjustments_Users_ActorUserId] FOREIGN KEY ([ActorUserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [administration].[IncidentStatusChanges] (
        [Id] uniqueidentifier NOT NULL,
        [IncidentId] uniqueidentifier NOT NULL,
        [FromStatus] int NULL,
        [ToStatus] int NOT NULL,
        [ActorUserId] uniqueidentifier NOT NULL,
        [Reason] nvarchar(1000) NOT NULL,
        [OccurredAtUtc] datetimeoffset(3) NOT NULL,
        CONSTRAINT [PK_IncidentStatusChanges] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_IncidentStatusChanges_Reason_NotBlank] CHECK (LEN(LTRIM(RTRIM([Reason]))) > 0),
        CONSTRAINT [CK_IncidentStatusChanges_Status] CHECK ([ToStatus] IN (1, 2, 3, 4) AND (([FromStatus] IS NULL AND [ToStatus] = 1) OR ([FromStatus] IS NOT NULL AND [FromStatus] IN (1, 2, 3, 4) AND [FromStatus] <> [ToStatus]))),
        CONSTRAINT [CK_IncidentStatusChanges_Utc] CHECK (([OccurredAtUtc] IS NULL OR DATEPART(TZOFFSET, [OccurredAtUtc]) = 0)),
        CONSTRAINT [FK_IncidentStatusChanges_Incidents_IncidentId] FOREIGN KEY ([IncidentId]) REFERENCES [administration].[Incidents] ([Id]),
        CONSTRAINT [FK_IncidentStatusChanges_Users_ActorUserId] FOREIGN KEY ([ActorUserId]) REFERENCES [identity].[Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [notifications].[NotificationOutboxMessages] (
        [Id] uniqueidentifier NOT NULL,
        [NotificationId] uniqueidentifier NOT NULL,
        [RecipientUserId] uniqueidentifier NOT NULL,
        [DeviceRegistrationId] uniqueidentifier NULL,
        [Channel] int NOT NULL,
        [Destination] nvarchar(2048) NULL,
        [Status] int NOT NULL,
        [AttemptCount] int NOT NULL,
        [CreatedAtUtc] datetimeoffset(3) NOT NULL,
        [AvailableAtUtc] datetimeoffset(3) NOT NULL,
        [LeaseId] uniqueidentifier NULL,
        [LeaseExpiresAtUtc] datetimeoffset(3) NULL,
        [SentAtUtc] datetimeoffset(3) NULL,
        [LastError] nvarchar(2000) NULL,
        [RowVersion] rowversion NOT NULL,
        CONSTRAINT [PK_NotificationOutboxMessages] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_NotificationOutboxMessages_Attempts] CHECK ([AttemptCount] >= 0),
        CONSTRAINT [CK_NotificationOutboxMessages_Available] CHECK ([AvailableAtUtc] >= [CreatedAtUtc]),
        CONSTRAINT [CK_NotificationOutboxMessages_Channel] CHECK ([Channel] IN (1, 2)),
        CONSTRAINT [CK_NotificationOutboxMessages_Destination] CHECK (([Channel] = 1 AND [DeviceRegistrationId] IS NULL AND [Destination] IS NOT NULL AND LEN(LTRIM(RTRIM([Destination]))) > 0) OR ([Channel] = 2 AND [DeviceRegistrationId] IS NOT NULL AND [Destination] IS NULL)),
        CONSTRAINT [CK_NotificationOutboxMessages_Lease] CHECK (([Status] = 2 AND [LeaseId] IS NOT NULL AND [LeaseExpiresAtUtc] IS NOT NULL AND [LeaseExpiresAtUtc] >= [CreatedAtUtc]) OR ([Status] IN (1, 3, 4) AND [LeaseId] IS NULL AND [LeaseExpiresAtUtc] IS NULL)),
        CONSTRAINT [CK_NotificationOutboxMessages_Sent] CHECK (([Status] = 3 AND [SentAtUtc] IS NOT NULL AND [SentAtUtc] >= [CreatedAtUtc]) OR ([Status] IN (1, 2, 4) AND [SentAtUtc] IS NULL)),
        CONSTRAINT [CK_NotificationOutboxMessages_Status] CHECK ([Status] IN (1, 2, 3, 4)),
        CONSTRAINT [CK_NotificationOutboxMessages_Utc] CHECK (([CreatedAtUtc] IS NULL OR DATEPART(TZOFFSET, [CreatedAtUtc]) = 0) AND ([AvailableAtUtc] IS NULL OR DATEPART(TZOFFSET, [AvailableAtUtc]) = 0) AND ([LeaseExpiresAtUtc] IS NULL OR DATEPART(TZOFFSET, [LeaseExpiresAtUtc]) = 0) AND ([SentAtUtc] IS NULL OR DATEPART(TZOFFSET, [SentAtUtc]) = 0)),
        CONSTRAINT [FK_NotificationOutboxMessages_DeviceRegistrations_DeviceRegistrationId_RecipientUserId] FOREIGN KEY ([DeviceRegistrationId], [RecipientUserId]) REFERENCES [notifications].[DeviceRegistrations] ([Id], [UserId]),
        CONSTRAINT [FK_NotificationOutboxMessages_Notifications_NotificationId_RecipientUserId] FOREIGN KEY ([NotificationId], [RecipientUserId]) REFERENCES [notifications].[Notifications] ([Id], [RecipientUserId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE TABLE [notifications].[NotificationDeliveryAttempts] (
        [Id] uniqueidentifier NOT NULL,
        [OutboxMessageId] uniqueidentifier NOT NULL,
        [AttemptNumber] int NOT NULL,
        [Outcome] int NOT NULL,
        [StartedAtUtc] datetimeoffset(3) NOT NULL,
        [FinishedAtUtc] datetimeoffset(3) NULL,
        [Error] nvarchar(2000) NULL,
        [ProviderMessageId] nvarchar(256) NULL,
        CONSTRAINT [PK_NotificationDeliveryAttempts] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_NotificationDeliveryAttempts_Number] CHECK ([AttemptNumber] > 0),
        CONSTRAINT [CK_NotificationDeliveryAttempts_Result] CHECK (([Outcome] = 1 AND [FinishedAtUtc] IS NULL AND [Error] IS NULL) OR ([Outcome] = 2 AND [FinishedAtUtc] IS NOT NULL AND [FinishedAtUtc] >= [StartedAtUtc] AND [Error] IS NULL) OR ([Outcome] = 3 AND [FinishedAtUtc] IS NOT NULL AND [FinishedAtUtc] >= [StartedAtUtc] AND [Error] IS NOT NULL AND LEN(LTRIM(RTRIM([Error]))) > 0)),
        CONSTRAINT [CK_NotificationDeliveryAttempts_Utc] CHECK (([StartedAtUtc] IS NULL OR DATEPART(TZOFFSET, [StartedAtUtc]) = 0) AND ([FinishedAtUtc] IS NULL OR DATEPART(TZOFFSET, [FinishedAtUtc]) = 0)),
        CONSTRAINT [FK_NotificationDeliveryAttempts_NotificationOutboxMessages_OutboxMessageId] FOREIGN KEY ([OutboxMessageId]) REFERENCES [notifications].[NotificationOutboxMessages] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [UX_Users_NormalizedEmail] ON [identity].[Users] ([NormalizedEmail]) WHERE [NormalizedEmail] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_AccountStatusChanges_ActorUserId] ON [identity].[AccountStatusChanges] ([ActorUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_AccountStatusChanges_UserId_OccurredAtUtc] ON [identity].[AccountStatusChanges] ([UserId], [OccurredAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Categories_Name] ON [listings].[Categories] ([Name]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_DeviceRegistrations_InstallationId] ON [notifications].[DeviceRegistrations] ([InstallationId]) WHERE [RevokedAtUtc] IS NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_DeviceRegistrations_Provider_TokenHash] ON [notifications].[DeviceRegistrations] ([Provider], [TokenHash]) WHERE [RevokedAtUtc] IS NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_DeviceRegistrations_UserId_RevokedAtUtc] ON [notifications].[DeviceRegistrations] ([UserId], [RevokedAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE UNIQUE INDEX [IX_DonationAcceptances_AcceptedByUserId_IdempotencyKey] ON [donations].[DonationAcceptances] ([AcceptedByUserId], [IdempotencyKey]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_DonationAcceptances_ListingId_ListingMode] ON [donations].[DonationAcceptances] ([ListingId], [ListingMode]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_DonationAcceptances_ListingId_Status] ON [donations].[DonationAcceptances] ([ListingId], [Status]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_DonationAcceptances_OrganizationId_CreatedAtUtc] ON [donations].[DonationAcceptances] ([OrganizationId], [CreatedAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_DonationAcceptances_Status_PickupDeadlineUtc] ON [donations].[DonationAcceptances] ([Status], [PickupDeadlineUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_DonationAcceptanceStatusChanges_ActorUserId] ON [donations].[DonationAcceptanceStatusChanges] ([ActorUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_DonationAcceptanceStatusChanges_DonationAcceptanceId_OccurredAtUtc] ON [donations].[DonationAcceptanceStatusChanges] ([DonationAcceptanceId], [OccurredAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_DonationHandovers_ConfirmedByUserId] ON [donations].[DonationHandovers] ([ConfirmedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_DonationHandovers_HandedOverAtUtc] ON [donations].[DonationHandovers] ([HandedOverAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_DonationReceipts_ReceivedAtUtc] ON [donations].[DonationReceipts] ([ReceivedAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_DonationReceipts_ReceivedByUserId] ON [donations].[DonationReceipts] ([ReceivedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_EstablishmentMembers_EstablishmentId_UserId] ON [establishments].[EstablishmentMembers] ([EstablishmentId], [UserId]) WHERE [RevokedAtUtc] IS NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_EstablishmentMembers_GrantedByUserId] ON [establishments].[EstablishmentMembers] ([GrantedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_EstablishmentMembers_RevokedByUserId] ON [establishments].[EstablishmentMembers] ([RevokedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_EstablishmentMembers_UserId_RevokedAtUtc] ON [establishments].[EstablishmentMembers] ([UserId], [RevokedAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [UX_EstablishmentMembers_ActivePrimary] ON [establishments].[EstablishmentMembers] ([EstablishmentId]) WHERE [RevokedAtUtc] IS NULL AND [IsPrimary] = 1');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Establishments_CreatedByUserId] ON [establishments].[Establishments] ([CreatedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Establishments_Status_Latitude_Longitude] ON [establishments].[Establishments] ([Status], [Latitude], [Longitude]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_EstablishmentStatusChanges_ActorUserId] ON [establishments].[EstablishmentStatusChanges] ([ActorUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_EstablishmentStatusChanges_EstablishmentId_OccurredAtUtc] ON [establishments].[EstablishmentStatusChanges] ([EstablishmentId], [OccurredAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Incidents_AssignedToUserId] ON [administration].[Incidents] ([AssignedToUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Incidents_DonationAcceptanceId] ON [administration].[Incidents] ([DonationAcceptanceId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Incidents_ListingId] ON [administration].[Incidents] ([ListingId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Incidents_ReporterUserId_CreatedAtUtc] ON [administration].[Incidents] ([ReporterUserId], [CreatedAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Incidents_ReservationId] ON [administration].[Incidents] ([ReservationId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Incidents_Status_CreatedAtUtc] ON [administration].[Incidents] ([Status], [CreatedAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_IncidentStatusChanges_ActorUserId] ON [administration].[IncidentStatusChanges] ([ActorUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_IncidentStatusChanges_IncidentId_OccurredAtUtc] ON [administration].[IncidentStatusChanges] ([IncidentId], [OccurredAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE UNIQUE INDEX [IX_ListingExpiryAlerts_ListingId_ThresholdMinutes] ON [notifications].[ListingExpiryAlerts] ([ListingId], [ThresholdMinutes]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_ListingFitnessChanges_ActorUserId] ON [listings].[ListingFitnessChanges] ([ActorUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_ListingFitnessChanges_ListingId_OccurredAtUtc] ON [listings].[ListingFitnessChanges] ([ListingId], [OccurredAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Listings_CategoryId] ON [listings].[Listings] ([CategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Listings_CreatedByUserId] ON [listings].[Listings] ([CreatedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Listings_EstablishmentId_CreatedAtUtc] ON [listings].[Listings] ([EstablishmentId], [CreatedAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Listings_Status_Mode_PickupDeadlineUtc] ON [listings].[Listings] ([Status], [Mode], [PickupDeadlineUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_ListingStatusChanges_ActorUserId] ON [listings].[ListingStatusChanges] ([ActorUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_ListingStatusChanges_ListingId_OccurredAtUtc] ON [listings].[ListingStatusChanges] ([ListingId], [OccurredAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE UNIQUE INDEX [IX_NotificationDeliveryAttempts_OutboxMessageId_AttemptNumber] ON [notifications].[NotificationDeliveryAttempts] ([OutboxMessageId], [AttemptNumber]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_NotificationOutboxMessages_DeviceRegistrationId_RecipientUserId] ON [notifications].[NotificationOutboxMessages] ([DeviceRegistrationId], [RecipientUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_NotificationOutboxMessages_NotificationId_Channel] ON [notifications].[NotificationOutboxMessages] ([NotificationId], [Channel]) WHERE [DeviceRegistrationId] IS NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_NotificationOutboxMessages_NotificationId_Channel_DeviceRegistrationId] ON [notifications].[NotificationOutboxMessages] ([NotificationId], [Channel], [DeviceRegistrationId]) WHERE [DeviceRegistrationId] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_NotificationOutboxMessages_NotificationId_RecipientUserId] ON [notifications].[NotificationOutboxMessages] ([NotificationId], [RecipientUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_NotificationOutboxMessages_Status_AvailableAtUtc] ON [notifications].[NotificationOutboxMessages] ([Status], [AvailableAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_NotificationOutboxMessages_Status_LeaseExpiresAtUtc] ON [notifications].[NotificationOutboxMessages] ([Status], [LeaseExpiresAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Notifications_DonationAcceptanceId] ON [notifications].[Notifications] ([DonationAcceptanceId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Notifications_ListingExpiryAlertId] ON [notifications].[Notifications] ([ListingExpiryAlertId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Notifications_OrganizationReviewId] ON [notifications].[Notifications] ([OrganizationReviewId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Notifications_RecipientUserId_CreatedAtUtc] ON [notifications].[Notifications] ([RecipientUserId], [CreatedAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Notifications_RecipientUserId_EventKey] ON [notifications].[Notifications] ([RecipientUserId], [EventKey]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Notifications_RecipientUserId_ReadAtUtc] ON [notifications].[Notifications] ([RecipientUserId], [ReadAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Notifications_ReservationId] ON [notifications].[Notifications] ([ReservationId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_OrganizationMembers_GrantedByUserId] ON [donations].[OrganizationMembers] ([GrantedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_OrganizationMembers_OrganizationId_UserId] ON [donations].[OrganizationMembers] ([OrganizationId], [UserId]) WHERE [RevokedAtUtc] IS NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_OrganizationMembers_RevokedByUserId] ON [donations].[OrganizationMembers] ([RevokedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_OrganizationMembers_UserId_RevokedAtUtc] ON [donations].[OrganizationMembers] ([UserId], [RevokedAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [UX_OrganizationMembers_ActivePrimary] ON [donations].[OrganizationMembers] ([OrganizationId]) WHERE [RevokedAtUtc] IS NULL AND [IsPrimary] = 1');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_OrganizationReviews_OrganizationId_ReviewedAtUtc] ON [donations].[OrganizationReviews] ([OrganizationId], [ReviewedAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_OrganizationReviews_ReviewerUserId] ON [donations].[OrganizationReviews] ([ReviewerUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Organizations_CreatedByUserId] ON [donations].[Organizations] ([CreatedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Organizations_VerificationStatus_CreatedAtUtc] ON [donations].[Organizations] ([VerificationStatus], [CreatedAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_ReservationDeliveries_ConfirmedByUserId] ON [reservations].[ReservationDeliveries] ([ConfirmedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_ReservationDeliveries_DeliveredAtUtc] ON [reservations].[ReservationDeliveries] ([DeliveredAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Reservations_ConsumerUserId_CreatedAtUtc] ON [reservations].[Reservations] ([ConsumerUserId], [CreatedAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Reservations_ConsumerUserId_IdempotencyKey] ON [reservations].[Reservations] ([ConsumerUserId], [IdempotencyKey]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Reservations_ListingId_ListingMode] ON [reservations].[Reservations] ([ListingId], [ListingMode]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Reservations_ListingId_Status] ON [reservations].[Reservations] ([ListingId], [Status]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Reservations_PickupReference] ON [reservations].[Reservations] ([PickupReference]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_Reservations_Status_PickupDeadlineUtc] ON [reservations].[Reservations] ([Status], [PickupDeadlineUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_ReservationStatusChanges_ActorUserId] ON [reservations].[ReservationStatusChanges] ([ActorUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_ReservationStatusChanges_ReservationId_OccurredAtUtc] ON [reservations].[ReservationStatusChanges] ([ReservationId], [OccurredAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_StockAdjustments_ActorUserId] ON [listings].[StockAdjustments] ([ActorUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_StockAdjustments_DonationAcceptanceId] ON [listings].[StockAdjustments] ([DonationAcceptanceId]) WHERE [DonationAcceptanceId] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_StockAdjustments_DonationAcceptanceId_ListingId] ON [listings].[StockAdjustments] ([DonationAcceptanceId], [ListingId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_StockAdjustments_ListingId_Kind_OccurredAtUtc] ON [listings].[StockAdjustments] ([ListingId], [Kind], [OccurredAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_StockAdjustments_ReservationId] ON [listings].[StockAdjustments] ([ReservationId]) WHERE [ReservationId] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_StockAdjustments_ReservationId_ListingId] ON [listings].[StockAdjustments] ([ReservationId], [ListingId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_StockTransfers_ActorUserId] ON [listings].[StockTransfers] ([ActorUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_StockTransfers_DestinationListingId_EstablishmentId_DestinationMode] ON [listings].[StockTransfers] ([DestinationListingId], [EstablishmentId], [DestinationMode]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_StockTransfers_DestinationListingId_OccurredAtUtc] ON [listings].[StockTransfers] ([DestinationListingId], [OccurredAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_StockTransfers_SourceListingId_EstablishmentId_SourceMode] ON [listings].[StockTransfers] ([SourceListingId], [EstablishmentId], [SourceMode]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    CREATE INDEX [IX_StockTransfers_SourceListingId_OccurredAtUtc] ON [listings].[StockTransfers] ([SourceListingId], [OccurredAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261030234244_AddV1DataModel'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261030234244_AddV1DataModel', N'10.0.11');
END;

COMMIT;
GO
