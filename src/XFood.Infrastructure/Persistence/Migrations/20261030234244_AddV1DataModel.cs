using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace XFood.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddV1DataModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "listings");

            migrationBuilder.EnsureSchema(
                name: "notifications");

            migrationBuilder.EnsureSchema(
                name: "donations");

            migrationBuilder.EnsureSchema(
                name: "establishments");

            migrationBuilder.EnsureSchema(
                name: "administration");

            migrationBuilder.EnsureSchema(
                name: "reservations");

            migrationBuilder.CreateTable(
                name: "AccountProfiles",
                schema: "identity",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountProfiles", x => x.UserId);
                    table.CheckConstraint("CK_AccountProfiles_DisplayName_NotBlank", "LEN(LTRIM(RTRIM([DisplayName]))) > 0");
                    table.CheckConstraint("CK_AccountProfiles_Status", "[Status] IN (1, 2)");
                    table.CheckConstraint("CK_AccountProfiles_Utc", "([CreatedAtUtc] IS NULL OR DATEPART(TZOFFSET, [CreatedAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_AccountProfiles_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                schema: "listings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false, collation: "Latin1_General_100_CI_AI"),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                    table.CheckConstraint("CK_Categories_Name_NotBlank", "LEN(LTRIM(RTRIM([Name]))) > 0");
                    table.CheckConstraint("CK_Categories_Utc", "([CreatedAtUtc] IS NULL OR DATEPART(TZOFFSET, [CreatedAtUtc]) = 0)");
                });

            migrationBuilder.CreateTable(
                name: "DeviceRegistrations",
                schema: "notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InstallationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Platform = table.Column<int>(type: "int", nullable: false),
                    Provider = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false, collation: "Latin1_General_100_BIN2"),
                    ProtectedPushToken = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: false),
                    TokenHash = table.Column<string>(type: "char(64)", nullable: false, collation: "Latin1_General_100_BIN2"),
                    RegisteredAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    RefreshedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    RevokedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceRegistrations", x => x.Id);
                    table.UniqueConstraint("AK_DeviceRegistrations_Id_UserId", x => new { x.Id, x.UserId });
                    table.CheckConstraint("CK_DeviceRegistrations_Dates", "[RefreshedAtUtc] >= [RegisteredAtUtc] AND ([RevokedAtUtc] IS NULL OR [RevokedAtUtc] >= [RefreshedAtUtc])");
                    table.CheckConstraint("CK_DeviceRegistrations_Platform", "[Platform] IN (1, 2)");
                    table.CheckConstraint("CK_DeviceRegistrations_ProtectedPushToken_NotBlank", "LEN(LTRIM(RTRIM([ProtectedPushToken]))) > 0");
                    table.CheckConstraint("CK_DeviceRegistrations_Provider_NotBlank", "LEN(LTRIM(RTRIM([Provider]))) > 0");
                    table.CheckConstraint("CK_DeviceRegistrations_TokenHash", "LEN([TokenHash]) = 64 AND [TokenHash] NOT LIKE '%[^0-9A-F]%'");
                    table.CheckConstraint("CK_DeviceRegistrations_Utc", "([RegisteredAtUtc] IS NULL OR DATEPART(TZOFFSET, [RegisteredAtUtc]) = 0) AND ([RefreshedAtUtc] IS NULL OR DATEPART(TZOFFSET, [RefreshedAtUtc]) = 0) AND ([RevokedAtUtc] IS NULL OR DATEPART(TZOFFSET, [RevokedAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_DeviceRegistrations_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Establishments",
                schema: "establishments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContactName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContactEmail = table.Column<string>(type: "nvarchar(320)", maxLength: 320, nullable: false),
                    ContactPhone = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Latitude = table.Column<decimal>(type: "decimal(9,6)", precision: 9, scale: 6, nullable: false),
                    Longitude = table.Column<decimal>(type: "decimal(9,6)", precision: 9, scale: 6, nullable: false),
                    TimeZoneId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Establishments", x => x.Id);
                    table.CheckConstraint("CK_Establishments_Address_NotBlank", "LEN(LTRIM(RTRIM([Address]))) > 0");
                    table.CheckConstraint("CK_Establishments_ContactEmail_NotBlank", "LEN(LTRIM(RTRIM([ContactEmail]))) > 0");
                    table.CheckConstraint("CK_Establishments_ContactName_NotBlank", "LEN(LTRIM(RTRIM([ContactName]))) > 0");
                    table.CheckConstraint("CK_Establishments_ContactPhone_NotBlank", "LEN(LTRIM(RTRIM([ContactPhone]))) > 0");
                    table.CheckConstraint("CK_Establishments_Coordinates", "[Latitude] BETWEEN -90 AND 90 AND [Longitude] BETWEEN -180 AND 180");
                    table.CheckConstraint("CK_Establishments_Name_NotBlank", "LEN(LTRIM(RTRIM([Name]))) > 0");
                    table.CheckConstraint("CK_Establishments_Status", "[Status] IN (1, 2, 3)");
                    table.CheckConstraint("CK_Establishments_TimeZoneId_NotBlank", "LEN(LTRIM(RTRIM([TimeZoneId]))) > 0");
                    table.CheckConstraint("CK_Establishments_Utc", "([CreatedAtUtc] IS NULL OR DATEPART(TZOFFSET, [CreatedAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_Establishments_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Organizations",
                schema: "donations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContactName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContactEmail = table.Column<string>(type: "nvarchar(320)", maxLength: 320, nullable: false),
                    ContactPhone = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    VerificationInformation = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    VerificationStatus = table.Column<int>(type: "int", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Organizations", x => x.Id);
                    table.CheckConstraint("CK_Organizations_Address_NotBlank", "LEN(LTRIM(RTRIM([Address]))) > 0");
                    table.CheckConstraint("CK_Organizations_ContactEmail_NotBlank", "LEN(LTRIM(RTRIM([ContactEmail]))) > 0");
                    table.CheckConstraint("CK_Organizations_ContactName_NotBlank", "LEN(LTRIM(RTRIM([ContactName]))) > 0");
                    table.CheckConstraint("CK_Organizations_ContactPhone_NotBlank", "LEN(LTRIM(RTRIM([ContactPhone]))) > 0");
                    table.CheckConstraint("CK_Organizations_Name_NotBlank", "LEN(LTRIM(RTRIM([Name]))) > 0");
                    table.CheckConstraint("CK_Organizations_Utc", "([CreatedAtUtc] IS NULL OR DATEPART(TZOFFSET, [CreatedAtUtc]) = 0)");
                    table.CheckConstraint("CK_Organizations_VerificationStatus", "[VerificationStatus] IN (1, 2, 3, 4)");
                    table.ForeignKey(
                        name: "FK_Organizations_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "AccountStatusChanges",
                schema: "identity",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FromStatus = table.Column<int>(type: "int", nullable: true),
                    ToStatus = table.Column<int>(type: "int", nullable: false),
                    ActorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    OccurredAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountStatusChanges", x => x.Id);
                    table.CheckConstraint("CK_AccountStatusChanges_Reason_NotBlank", "LEN(LTRIM(RTRIM([Reason]))) > 0");
                    table.CheckConstraint("CK_AccountStatusChanges_Transition", "([FromStatus] IS NULL AND [ToStatus] = 1) OR ([FromStatus] IS NOT NULL AND (([FromStatus] = 1 AND [ToStatus] = 2) OR ([FromStatus] = 2 AND [ToStatus] = 1)))");
                    table.CheckConstraint("CK_AccountStatusChanges_Utc", "([OccurredAtUtc] IS NULL OR DATEPART(TZOFFSET, [OccurredAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_AccountStatusChanges_AccountProfiles_UserId",
                        column: x => x.UserId,
                        principalSchema: "identity",
                        principalTable: "AccountProfiles",
                        principalColumn: "UserId");
                    table.ForeignKey(
                        name: "FK_AccountStatusChanges_Users_ActorUserId",
                        column: x => x.ActorUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "EstablishmentMembers",
                schema: "establishments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EstablishmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Role = table.Column<int>(type: "int", nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    JoinedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    RevokedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: true),
                    GrantedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RevokedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstablishmentMembers", x => x.Id);
                    table.CheckConstraint("CK_EstablishmentMembers_Revocation", "([RevokedAtUtc] IS NULL AND [RevokedByUserId] IS NULL) OR ([RevokedAtUtc] IS NOT NULL AND [RevokedByUserId] IS NOT NULL AND [RevokedAtUtc] >= [JoinedAtUtc])");
                    table.CheckConstraint("CK_EstablishmentMembers_Role", "[Role] IN (1, 2)");
                    table.CheckConstraint("CK_EstablishmentMembers_Utc", "([JoinedAtUtc] IS NULL OR DATEPART(TZOFFSET, [JoinedAtUtc]) = 0) AND ([RevokedAtUtc] IS NULL OR DATEPART(TZOFFSET, [RevokedAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_EstablishmentMembers_Establishments_EstablishmentId",
                        column: x => x.EstablishmentId,
                        principalSchema: "establishments",
                        principalTable: "Establishments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EstablishmentMembers_Users_GrantedByUserId",
                        column: x => x.GrantedByUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EstablishmentMembers_Users_RevokedByUserId",
                        column: x => x.RevokedByUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EstablishmentMembers_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "EstablishmentStatusChanges",
                schema: "establishments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EstablishmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FromStatus = table.Column<int>(type: "int", nullable: true),
                    ToStatus = table.Column<int>(type: "int", nullable: false),
                    ActorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    OccurredAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstablishmentStatusChanges", x => x.Id);
                    table.CheckConstraint("CK_EstablishmentStatusChanges_Reason_NotBlank", "LEN(LTRIM(RTRIM([Reason]))) > 0");
                    table.CheckConstraint("CK_EstablishmentStatusChanges_Status", "[ToStatus] IN (1, 2, 3) AND ([FromStatus] IS NULL OR ([FromStatus] IN (1, 2, 3) AND [FromStatus] <> [ToStatus]))");
                    table.CheckConstraint("CK_EstablishmentStatusChanges_Utc", "([OccurredAtUtc] IS NULL OR DATEPART(TZOFFSET, [OccurredAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_EstablishmentStatusChanges_Establishments_EstablishmentId",
                        column: x => x.EstablishmentId,
                        principalSchema: "establishments",
                        principalTable: "Establishments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EstablishmentStatusChanges_Users_ActorUserId",
                        column: x => x.ActorUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Listings",
                schema: "listings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EstablishmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Mode = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    InitialQuantity = table.Column<int>(type: "int", nullable: false),
                    AddedQuantity = table.Column<int>(type: "int", nullable: false),
                    TransferredInQuantity = table.Column<int>(type: "int", nullable: false),
                    TransferredOutQuantity = table.Column<int>(type: "int", nullable: false),
                    AvailableQuantity = table.Column<int>(type: "int", nullable: false),
                    AssignedQuantity = table.Column<int>(type: "int", nullable: false),
                    FulfilledQuantity = table.Column<int>(type: "int", nullable: false),
                    WrittenOffQuantity = table.Column<int>(type: "int", nullable: false),
                    OriginalUnitPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    DiscountedUnitPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Currency = table.Column<string>(type: "char(3)", nullable: false, collation: "Latin1_General_100_BIN2"),
                    PickupInstructions = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    PaymentInstructions = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    FoodSafetyDeclared = table.Column<bool>(type: "bit", nullable: false),
                    IsFoodFit = table.Column<bool>(type: "bit", nullable: false),
                    PickupStartsAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    PickupDeadlineUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Listings", x => x.Id);
                    table.UniqueConstraint("AK_Listings_Id_EstablishmentId_Mode", x => new { x.Id, x.EstablishmentId, x.Mode });
                    table.UniqueConstraint("AK_Listings_Id_Mode", x => new { x.Id, x.Mode });
                    table.CheckConstraint("CK_Listings_Currency", "[Currency] = 'DOP'");
                    table.CheckConstraint("CK_Listings_Description_NotBlank", "LEN(LTRIM(RTRIM([Description]))) > 0");
                    table.CheckConstraint("CK_Listings_FoodSafety", "[FoodSafetyDeclared] = 1");
                    table.CheckConstraint("CK_Listings_Mode", "[Mode] IN (1, 2)");
                    table.CheckConstraint("CK_Listings_Payment", "([Mode] = 1 AND [PaymentInstructions] IS NOT NULL AND LEN(LTRIM(RTRIM([PaymentInstructions]))) > 0) OR ([Mode] = 2 AND [PaymentInstructions] IS NULL)");
                    table.CheckConstraint("CK_Listings_PickupInstructions_NotBlank", "LEN(LTRIM(RTRIM([PickupInstructions]))) > 0");
                    table.CheckConstraint("CK_Listings_Prices", "([Mode] = 1 AND [OriginalUnitPrice] IS NOT NULL AND [DiscountedUnitPrice] IS NOT NULL AND [OriginalUnitPrice] > 0 AND [DiscountedUnitPrice] > 0 AND [DiscountedUnitPrice] < [OriginalUnitPrice]) OR ([Mode] = 2 AND [OriginalUnitPrice] IS NULL AND [DiscountedUnitPrice] IS NULL)");
                    table.CheckConstraint("CK_Listings_Quantities", "[InitialQuantity] >= 0 AND [AddedQuantity] >= 0 AND [TransferredInQuantity] >= 0 AND [TransferredOutQuantity] >= 0 AND CAST([InitialQuantity] AS bigint) + [TransferredInQuantity] > 0 AND [AvailableQuantity] >= 0 AND [AssignedQuantity] >= 0 AND [FulfilledQuantity] >= 0 AND [WrittenOffQuantity] >= 0");
                    table.CheckConstraint("CK_Listings_Status", "[Status] IN (1, 2, 3, 4) AND ([Status] <> 2 OR [AvailableQuantity] = 0)");
                    table.CheckConstraint("CK_Listings_StockBalance", "CAST([InitialQuantity] AS bigint) + [AddedQuantity] + [TransferredInQuantity] = CAST([AvailableQuantity] AS bigint) + [AssignedQuantity] + [FulfilledQuantity] + [WrittenOffQuantity] + [TransferredOutQuantity]");
                    table.CheckConstraint("CK_Listings_Title_NotBlank", "LEN(LTRIM(RTRIM([Title]))) > 0");
                    table.CheckConstraint("CK_Listings_Utc", "([PickupStartsAtUtc] IS NULL OR DATEPART(TZOFFSET, [PickupStartsAtUtc]) = 0) AND ([PickupDeadlineUtc] IS NULL OR DATEPART(TZOFFSET, [PickupDeadlineUtc]) = 0) AND ([CreatedAtUtc] IS NULL OR DATEPART(TZOFFSET, [CreatedAtUtc]) = 0)");
                    table.CheckConstraint("CK_Listings_Window", "[PickupStartsAtUtc] < [PickupDeadlineUtc] AND [CreatedAtUtc] < [PickupDeadlineUtc]");
                    table.ForeignKey(
                        name: "FK_Listings_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalSchema: "listings",
                        principalTable: "Categories",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Listings_Establishments_EstablishmentId",
                        column: x => x.EstablishmentId,
                        principalSchema: "establishments",
                        principalTable: "Establishments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Listings_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "OrganizationMembers",
                schema: "donations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Role = table.Column<int>(type: "int", nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    JoinedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    RevokedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: true),
                    GrantedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RevokedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationMembers", x => x.Id);
                    table.CheckConstraint("CK_OrganizationMembers_Revocation", "([RevokedAtUtc] IS NULL AND [RevokedByUserId] IS NULL) OR ([RevokedAtUtc] IS NOT NULL AND [RevokedByUserId] IS NOT NULL AND [RevokedAtUtc] >= [JoinedAtUtc])");
                    table.CheckConstraint("CK_OrganizationMembers_Role", "[Role] IN (1, 2)");
                    table.CheckConstraint("CK_OrganizationMembers_Utc", "([JoinedAtUtc] IS NULL OR DATEPART(TZOFFSET, [JoinedAtUtc]) = 0) AND ([RevokedAtUtc] IS NULL OR DATEPART(TZOFFSET, [RevokedAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_OrganizationMembers_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalSchema: "donations",
                        principalTable: "Organizations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OrganizationMembers_Users_GrantedByUserId",
                        column: x => x.GrantedByUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OrganizationMembers_Users_RevokedByUserId",
                        column: x => x.RevokedByUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OrganizationMembers_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "OrganizationReviews",
                schema: "donations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FromStatus = table.Column<int>(type: "int", nullable: false),
                    ToStatus = table.Column<int>(type: "int", nullable: false),
                    ReviewerUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    NameSnapshot = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContactNameSnapshot = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContactEmailSnapshot = table.Column<string>(type: "nvarchar(320)", maxLength: 320, nullable: false),
                    ContactPhoneSnapshot = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    AddressSnapshot = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    VerificationInformationSnapshot = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ReviewedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationReviews", x => x.Id);
                    table.CheckConstraint("CK_OrganizationReviews_AddressSnapshot_NotBlank", "LEN(LTRIM(RTRIM([AddressSnapshot]))) > 0");
                    table.CheckConstraint("CK_OrganizationReviews_ContactEmailSnapshot_NotBlank", "LEN(LTRIM(RTRIM([ContactEmailSnapshot]))) > 0");
                    table.CheckConstraint("CK_OrganizationReviews_ContactNameSnapshot_NotBlank", "LEN(LTRIM(RTRIM([ContactNameSnapshot]))) > 0");
                    table.CheckConstraint("CK_OrganizationReviews_ContactPhoneSnapshot_NotBlank", "LEN(LTRIM(RTRIM([ContactPhoneSnapshot]))) > 0");
                    table.CheckConstraint("CK_OrganizationReviews_NameSnapshot_NotBlank", "LEN(LTRIM(RTRIM([NameSnapshot]))) > 0");
                    table.CheckConstraint("CK_OrganizationReviews_Reason_NotBlank", "LEN(LTRIM(RTRIM([Reason]))) > 0");
                    table.CheckConstraint("CK_OrganizationReviews_Status", "[FromStatus] IN (1, 2, 3, 4) AND [ToStatus] IN (2, 3, 4)");
                    table.CheckConstraint("CK_OrganizationReviews_Utc", "([ReviewedAtUtc] IS NULL OR DATEPART(TZOFFSET, [ReviewedAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_OrganizationReviews_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalSchema: "donations",
                        principalTable: "Organizations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OrganizationReviews_Users_ReviewerUserId",
                        column: x => x.ReviewerUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "DonationAcceptances",
                schema: "donations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ListingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AcceptedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    ListingTitleSnapshot = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PickupAddressSnapshot = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    PickupInstructionsSnapshot = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    TimeZoneIdSnapshot = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PickupStartsAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    PickupDeadlineUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    IdempotencyKey = table.Column<string>(type: "varchar(128)", unicode: false, maxLength: 128, nullable: false, collation: "Latin1_General_100_BIN2"),
                    RequestHash = table.Column<string>(type: "char(64)", nullable: false, collation: "Latin1_General_100_BIN2"),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    ClosedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    ListingMode = table.Column<int>(type: "int", nullable: false, defaultValue: 2)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DonationAcceptances", x => x.Id);
                    table.UniqueConstraint("AK_DonationAcceptances_Id_ListingId", x => new { x.Id, x.ListingId });
                    table.CheckConstraint("CK_DonationAcceptances_Closed", "([Status] = 1 AND [ClosedAtUtc] IS NULL) OR ([Status] IN (2, 3, 4) AND [ClosedAtUtc] IS NOT NULL AND [ClosedAtUtc] >= [CreatedAtUtc])");
                    table.CheckConstraint("CK_DonationAcceptances_DonationOnly", "[ListingMode] = 2");
                    table.CheckConstraint("CK_DonationAcceptances_IdempotencyKey", "LEN([IdempotencyKey]) > 0 AND DATALENGTH([IdempotencyKey]) = DATALENGTH(LTRIM(RTRIM([IdempotencyKey])))");
                    table.CheckConstraint("CK_DonationAcceptances_ListingTitleSnapshot_NotBlank", "LEN(LTRIM(RTRIM([ListingTitleSnapshot]))) > 0");
                    table.CheckConstraint("CK_DonationAcceptances_PickupAddressSnapshot_NotBlank", "LEN(LTRIM(RTRIM([PickupAddressSnapshot]))) > 0");
                    table.CheckConstraint("CK_DonationAcceptances_PickupInstructionsSnapshot_NotBlank", "LEN(LTRIM(RTRIM([PickupInstructionsSnapshot]))) > 0");
                    table.CheckConstraint("CK_DonationAcceptances_Quantity", "[Quantity] > 0");
                    table.CheckConstraint("CK_DonationAcceptances_RequestHash", "LEN([RequestHash]) = 64 AND [RequestHash] NOT LIKE '%[^0-9A-F]%'");
                    table.CheckConstraint("CK_DonationAcceptances_Status", "[Status] IN (1, 2, 3, 4)");
                    table.CheckConstraint("CK_DonationAcceptances_TimeZoneIdSnapshot_NotBlank", "LEN(LTRIM(RTRIM([TimeZoneIdSnapshot]))) > 0");
                    table.CheckConstraint("CK_DonationAcceptances_Utc", "([PickupStartsAtUtc] IS NULL OR DATEPART(TZOFFSET, [PickupStartsAtUtc]) = 0) AND ([PickupDeadlineUtc] IS NULL OR DATEPART(TZOFFSET, [PickupDeadlineUtc]) = 0) AND ([CreatedAtUtc] IS NULL OR DATEPART(TZOFFSET, [CreatedAtUtc]) = 0) AND ([ClosedAtUtc] IS NULL OR DATEPART(TZOFFSET, [ClosedAtUtc]) = 0)");
                    table.CheckConstraint("CK_DonationAcceptances_Window", "[PickupStartsAtUtc] < [PickupDeadlineUtc] AND [CreatedAtUtc] < [PickupDeadlineUtc]");
                    table.ForeignKey(
                        name: "FK_DonationAcceptances_Listings_ListingId_ListingMode",
                        columns: x => new { x.ListingId, x.ListingMode },
                        principalSchema: "listings",
                        principalTable: "Listings",
                        principalColumns: new[] { "Id", "Mode" });
                    table.ForeignKey(
                        name: "FK_DonationAcceptances_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalSchema: "donations",
                        principalTable: "Organizations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DonationAcceptances_Users_AcceptedByUserId",
                        column: x => x.AcceptedByUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ListingExpiryAlerts",
                schema: "notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ListingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ThresholdMinutes = table.Column<int>(type: "int", nullable: false),
                    AvailableQuantitySnapshot = table.Column<int>(type: "int", nullable: false),
                    DeadlineSnapshotUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListingExpiryAlerts", x => x.Id);
                    table.CheckConstraint("CK_ListingExpiryAlerts_Deadline", "[CreatedAtUtc] < [DeadlineSnapshotUtc]");
                    table.CheckConstraint("CK_ListingExpiryAlerts_Quantity", "[AvailableQuantitySnapshot] > 0");
                    table.CheckConstraint("CK_ListingExpiryAlerts_Threshold", "[ThresholdMinutes] > 0");
                    table.CheckConstraint("CK_ListingExpiryAlerts_Utc", "([DeadlineSnapshotUtc] IS NULL OR DATEPART(TZOFFSET, [DeadlineSnapshotUtc]) = 0) AND ([CreatedAtUtc] IS NULL OR DATEPART(TZOFFSET, [CreatedAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_ListingExpiryAlerts_Listings_ListingId",
                        column: x => x.ListingId,
                        principalSchema: "listings",
                        principalTable: "Listings",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ListingFitnessChanges",
                schema: "listings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ListingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FromIsFoodFit = table.Column<bool>(type: "bit", nullable: false),
                    ToIsFoodFit = table.Column<bool>(type: "bit", nullable: false),
                    ActorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    OccurredAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListingFitnessChanges", x => x.Id);
                    table.CheckConstraint("CK_ListingFitnessChanges_Changed", "[FromIsFoodFit] <> [ToIsFoodFit]");
                    table.CheckConstraint("CK_ListingFitnessChanges_Reason_NotBlank", "LEN(LTRIM(RTRIM([Reason]))) > 0");
                    table.CheckConstraint("CK_ListingFitnessChanges_Utc", "([OccurredAtUtc] IS NULL OR DATEPART(TZOFFSET, [OccurredAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_ListingFitnessChanges_Listings_ListingId",
                        column: x => x.ListingId,
                        principalSchema: "listings",
                        principalTable: "Listings",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ListingFitnessChanges_Users_ActorUserId",
                        column: x => x.ActorUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ListingStatusChanges",
                schema: "listings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ListingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FromStatus = table.Column<int>(type: "int", nullable: true),
                    ToStatus = table.Column<int>(type: "int", nullable: false),
                    ActorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    OccurredAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListingStatusChanges", x => x.Id);
                    table.CheckConstraint("CK_ListingStatusChanges_Actor", "[ActorUserId] IS NOT NULL OR [ToStatus] IN (1, 2, 4)");
                    table.CheckConstraint("CK_ListingStatusChanges_Reason_NotBlank", "LEN(LTRIM(RTRIM([Reason]))) > 0");
                    table.CheckConstraint("CK_ListingStatusChanges_Transition", "([FromStatus] IS NULL AND [ToStatus] = 1) OR ([FromStatus] IS NOT NULL AND (([FromStatus] = 1 AND [ToStatus] IN (2, 3, 4)) OR ([FromStatus] = 2 AND [ToStatus] IN (1, 3, 4))))");
                    table.CheckConstraint("CK_ListingStatusChanges_Utc", "([OccurredAtUtc] IS NULL OR DATEPART(TZOFFSET, [OccurredAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_ListingStatusChanges_Listings_ListingId",
                        column: x => x.ListingId,
                        principalSchema: "listings",
                        principalTable: "Listings",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ListingStatusChanges_Users_ActorUserId",
                        column: x => x.ActorUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Reservations",
                schema: "reservations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ListingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConsumerUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "char(3)", nullable: false, collation: "Latin1_General_100_BIN2"),
                    ListingTitleSnapshot = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PickupAddressSnapshot = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    PickupInstructionsSnapshot = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    PaymentInstructionsSnapshot = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    TimeZoneIdSnapshot = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PickupStartsAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    PickupDeadlineUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    PickupReference = table.Column<string>(type: "varchar(32)", unicode: false, maxLength: 32, nullable: false, collation: "Latin1_General_100_BIN2"),
                    IdempotencyKey = table.Column<string>(type: "varchar(128)", unicode: false, maxLength: 128, nullable: false, collation: "Latin1_General_100_BIN2"),
                    RequestHash = table.Column<string>(type: "char(64)", nullable: false, collation: "Latin1_General_100_BIN2"),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    ClosedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    ListingMode = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reservations", x => x.Id);
                    table.UniqueConstraint("AK_Reservations_Id_ListingId", x => new { x.Id, x.ListingId });
                    table.CheckConstraint("CK_Reservations_Closed", "([Status] = 1 AND [ClosedAtUtc] IS NULL) OR ([Status] IN (2, 3, 4) AND [ClosedAtUtc] IS NOT NULL AND [ClosedAtUtc] >= [CreatedAtUtc])");
                    table.CheckConstraint("CK_Reservations_IdempotencyKey", "LEN([IdempotencyKey]) > 0 AND DATALENGTH([IdempotencyKey]) = DATALENGTH(LTRIM(RTRIM([IdempotencyKey])))");
                    table.CheckConstraint("CK_Reservations_ListingTitleSnapshot_NotBlank", "LEN(LTRIM(RTRIM([ListingTitleSnapshot]))) > 0");
                    table.CheckConstraint("CK_Reservations_PaymentInstructionsSnapshot_NotBlank", "LEN(LTRIM(RTRIM([PaymentInstructionsSnapshot]))) > 0");
                    table.CheckConstraint("CK_Reservations_PickupAddressSnapshot_NotBlank", "LEN(LTRIM(RTRIM([PickupAddressSnapshot]))) > 0");
                    table.CheckConstraint("CK_Reservations_PickupInstructionsSnapshot_NotBlank", "LEN(LTRIM(RTRIM([PickupInstructionsSnapshot]))) > 0");
                    table.CheckConstraint("CK_Reservations_PickupReference_NotBlank", "LEN(LTRIM(RTRIM([PickupReference]))) > 0");
                    table.CheckConstraint("CK_Reservations_Price", "[UnitPrice] > 0 AND [Currency] = 'DOP'");
                    table.CheckConstraint("CK_Reservations_Quantity", "[Quantity] > 0");
                    table.CheckConstraint("CK_Reservations_RequestHash", "LEN([RequestHash]) = 64 AND [RequestHash] NOT LIKE '%[^0-9A-F]%'");
                    table.CheckConstraint("CK_Reservations_SaleOnly", "[ListingMode] = 1");
                    table.CheckConstraint("CK_Reservations_Status", "[Status] IN (1, 2, 3, 4)");
                    table.CheckConstraint("CK_Reservations_TimeZoneIdSnapshot_NotBlank", "LEN(LTRIM(RTRIM([TimeZoneIdSnapshot]))) > 0");
                    table.CheckConstraint("CK_Reservations_Utc", "([PickupStartsAtUtc] IS NULL OR DATEPART(TZOFFSET, [PickupStartsAtUtc]) = 0) AND ([PickupDeadlineUtc] IS NULL OR DATEPART(TZOFFSET, [PickupDeadlineUtc]) = 0) AND ([CreatedAtUtc] IS NULL OR DATEPART(TZOFFSET, [CreatedAtUtc]) = 0) AND ([ClosedAtUtc] IS NULL OR DATEPART(TZOFFSET, [ClosedAtUtc]) = 0)");
                    table.CheckConstraint("CK_Reservations_Window", "[PickupStartsAtUtc] < [PickupDeadlineUtc] AND [CreatedAtUtc] < [PickupDeadlineUtc]");
                    table.ForeignKey(
                        name: "FK_Reservations_Listings_ListingId_ListingMode",
                        columns: x => new { x.ListingId, x.ListingMode },
                        principalSchema: "listings",
                        principalTable: "Listings",
                        principalColumns: new[] { "Id", "Mode" });
                    table.ForeignKey(
                        name: "FK_Reservations_Users_ConsumerUserId",
                        column: x => x.ConsumerUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "StockTransfers",
                schema: "listings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EstablishmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SourceListingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SourceMode = table.Column<int>(type: "int", nullable: false),
                    DestinationListingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DestinationMode = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    ActorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    OccurredAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockTransfers", x => x.Id);
                    table.CheckConstraint("CK_StockTransfers_DifferentListings", "[SourceListingId] <> [DestinationListingId]");
                    table.CheckConstraint("CK_StockTransfers_Modes", "[SourceMode] IN (1, 2) AND [DestinationMode] IN (1, 2)");
                    table.CheckConstraint("CK_StockTransfers_Quantity", "[Quantity] > 0");
                    table.CheckConstraint("CK_StockTransfers_Reason_NotBlank", "LEN(LTRIM(RTRIM([Reason]))) > 0");
                    table.CheckConstraint("CK_StockTransfers_Utc", "([OccurredAtUtc] IS NULL OR DATEPART(TZOFFSET, [OccurredAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_StockTransfers_Listings_DestinationListingId_EstablishmentId_DestinationMode",
                        columns: x => new { x.DestinationListingId, x.EstablishmentId, x.DestinationMode },
                        principalSchema: "listings",
                        principalTable: "Listings",
                        principalColumns: new[] { "Id", "EstablishmentId", "Mode" });
                    table.ForeignKey(
                        name: "FK_StockTransfers_Listings_SourceListingId_EstablishmentId_SourceMode",
                        columns: x => new { x.SourceListingId, x.EstablishmentId, x.SourceMode },
                        principalSchema: "listings",
                        principalTable: "Listings",
                        principalColumns: new[] { "Id", "EstablishmentId", "Mode" });
                    table.ForeignKey(
                        name: "FK_StockTransfers_Users_ActorUserId",
                        column: x => x.ActorUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "DonationAcceptanceStatusChanges",
                schema: "donations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DonationAcceptanceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FromStatus = table.Column<int>(type: "int", nullable: true),
                    ToStatus = table.Column<int>(type: "int", nullable: false),
                    ActorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    OccurredAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DonationAcceptanceStatusChanges", x => x.Id);
                    table.CheckConstraint("CK_DonationAcceptanceStatusChanges_Actor", "[ActorUserId] IS NOT NULL OR [ToStatus] = 4");
                    table.CheckConstraint("CK_DonationAcceptanceStatusChanges_Reason_NotBlank", "LEN(LTRIM(RTRIM([Reason]))) > 0");
                    table.CheckConstraint("CK_DonationAcceptanceStatusChanges_Transition", "([FromStatus] IS NULL AND [ToStatus] = 1) OR ([FromStatus] IS NOT NULL AND [FromStatus] = 1 AND [ToStatus] IN (2, 3, 4))");
                    table.CheckConstraint("CK_DonationAcceptanceStatusChanges_Utc", "([OccurredAtUtc] IS NULL OR DATEPART(TZOFFSET, [OccurredAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_DonationAcceptanceStatusChanges_DonationAcceptances_DonationAcceptanceId",
                        column: x => x.DonationAcceptanceId,
                        principalSchema: "donations",
                        principalTable: "DonationAcceptances",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DonationAcceptanceStatusChanges_Users_ActorUserId",
                        column: x => x.ActorUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "DonationHandovers",
                schema: "donations",
                columns: table => new
                {
                    DonationAcceptanceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConfirmedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HandedOverAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DonationHandovers", x => x.DonationAcceptanceId);
                    table.CheckConstraint("CK_DonationHandovers_Utc", "([HandedOverAtUtc] IS NULL OR DATEPART(TZOFFSET, [HandedOverAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_DonationHandovers_DonationAcceptances_DonationAcceptanceId",
                        column: x => x.DonationAcceptanceId,
                        principalSchema: "donations",
                        principalTable: "DonationAcceptances",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DonationHandovers_Users_ConfirmedByUserId",
                        column: x => x.ConfirmedByUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "DonationReceipts",
                schema: "donations",
                columns: table => new
                {
                    DonationAcceptanceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReceivedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReceivedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DonationReceipts", x => x.DonationAcceptanceId);
                    table.CheckConstraint("CK_DonationReceipts_Utc", "([ReceivedAtUtc] IS NULL OR DATEPART(TZOFFSET, [ReceivedAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_DonationReceipts_DonationAcceptances_DonationAcceptanceId",
                        column: x => x.DonationAcceptanceId,
                        principalSchema: "donations",
                        principalTable: "DonationAcceptances",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DonationReceipts_Users_ReceivedByUserId",
                        column: x => x.ReceivedByUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Incidents",
                schema: "administration",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReporterUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AssignedToUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ListingId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ReservationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DonationAcceptanceId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Kind = table.Column<int>(type: "int", nullable: false),
                    ActualQuantity = table.Column<int>(type: "int", nullable: true),
                    ObservedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: true),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    ClosedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Incidents", x => x.Id);
                    table.CheckConstraint("CK_Incidents_Closed", "([Status] IN (1, 2) AND [ClosedAtUtc] IS NULL) OR ([Status] IN (3, 4) AND [ClosedAtUtc] IS NOT NULL AND [ClosedAtUtc] >= [CreatedAtUtc])");
                    table.CheckConstraint("CK_Incidents_Description_NotBlank", "LEN(LTRIM(RTRIM([Description]))) > 0");
                    table.CheckConstraint("CK_Incidents_Kind", "[Kind] IN (1, 2, 3)");
                    table.CheckConstraint("CK_Incidents_Observation", "[ObservedAtUtc] IS NULL OR [ObservedAtUtc] <= [CreatedAtUtc]");
                    table.CheckConstraint("CK_Incidents_PickupFacts", "([Kind] = 1 AND [ActualQuantity] IS NULL) OR ([Kind] = 2 AND [ActualQuantity] IS NOT NULL AND [ActualQuantity] > 0 AND [ObservedAtUtc] IS NOT NULL AND ([ReservationId] IS NOT NULL OR [DonationAcceptanceId] IS NOT NULL)) OR ([Kind] = 3 AND ([ActualQuantity] IS NULL OR [ActualQuantity] >= 0) AND [ObservedAtUtc] IS NOT NULL AND ([ReservationId] IS NOT NULL OR [DonationAcceptanceId] IS NOT NULL))");
                    table.CheckConstraint("CK_Incidents_Status", "[Status] IN (1, 2, 3, 4)");
                    table.CheckConstraint("CK_Incidents_Target", "(CASE WHEN [ListingId] IS NULL THEN 0 ELSE 1 END + CASE WHEN [ReservationId] IS NULL THEN 0 ELSE 1 END + CASE WHEN [DonationAcceptanceId] IS NULL THEN 0 ELSE 1 END) <= 1");
                    table.CheckConstraint("CK_Incidents_Title_NotBlank", "LEN(LTRIM(RTRIM([Title]))) > 0");
                    table.CheckConstraint("CK_Incidents_Utc", "([ObservedAtUtc] IS NULL OR DATEPART(TZOFFSET, [ObservedAtUtc]) = 0) AND ([CreatedAtUtc] IS NULL OR DATEPART(TZOFFSET, [CreatedAtUtc]) = 0) AND ([ClosedAtUtc] IS NULL OR DATEPART(TZOFFSET, [ClosedAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_Incidents_DonationAcceptances_DonationAcceptanceId",
                        column: x => x.DonationAcceptanceId,
                        principalSchema: "donations",
                        principalTable: "DonationAcceptances",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Incidents_Listings_ListingId",
                        column: x => x.ListingId,
                        principalSchema: "listings",
                        principalTable: "Listings",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Incidents_Reservations_ReservationId",
                        column: x => x.ReservationId,
                        principalSchema: "reservations",
                        principalTable: "Reservations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Incidents_Users_AssignedToUserId",
                        column: x => x.AssignedToUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Incidents_Users_ReporterUserId",
                        column: x => x.ReporterUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                schema: "notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecipientUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Kind = table.Column<int>(type: "int", nullable: false),
                    EventKey = table.Column<string>(type: "varchar(128)", unicode: false, maxLength: 128, nullable: false, collation: "Latin1_General_100_BIN2"),
                    Subject = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Body = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    ReservationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DonationAcceptanceId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OrganizationReviewId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ListingExpiryAlertId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    ReadAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.UniqueConstraint("AK_Notifications_Id_RecipientUserId", x => new { x.Id, x.RecipientUserId });
                    table.CheckConstraint("CK_Notifications_Body_NotBlank", "LEN(LTRIM(RTRIM([Body]))) > 0");
                    table.CheckConstraint("CK_Notifications_EventKey_NotBlank", "LEN(LTRIM(RTRIM([EventKey]))) > 0");
                    table.CheckConstraint("CK_Notifications_Read", "[ReadAtUtc] IS NULL OR [ReadAtUtc] >= [CreatedAtUtc]");
                    table.CheckConstraint("CK_Notifications_Subject_NotBlank", "LEN(LTRIM(RTRIM([Subject]))) > 0");
                    table.CheckConstraint("CK_Notifications_Target", "([Kind] IN (1, 2, 3, 4) AND [ReservationId] IS NOT NULL AND [DonationAcceptanceId] IS NULL AND [OrganizationReviewId] IS NULL AND [ListingExpiryAlertId] IS NULL) OR ([Kind] IN (5, 6, 7, 8) AND [ReservationId] IS NULL AND [DonationAcceptanceId] IS NOT NULL AND [OrganizationReviewId] IS NULL AND [ListingExpiryAlertId] IS NULL) OR ([Kind] = 9 AND [ReservationId] IS NULL AND [DonationAcceptanceId] IS NULL AND [OrganizationReviewId] IS NOT NULL AND [ListingExpiryAlertId] IS NULL) OR ([Kind] = 10 AND [ReservationId] IS NULL AND [DonationAcceptanceId] IS NULL AND [OrganizationReviewId] IS NULL AND [ListingExpiryAlertId] IS NOT NULL)");
                    table.CheckConstraint("CK_Notifications_Utc", "([CreatedAtUtc] IS NULL OR DATEPART(TZOFFSET, [CreatedAtUtc]) = 0) AND ([ReadAtUtc] IS NULL OR DATEPART(TZOFFSET, [ReadAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_Notifications_DonationAcceptances_DonationAcceptanceId",
                        column: x => x.DonationAcceptanceId,
                        principalSchema: "donations",
                        principalTable: "DonationAcceptances",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Notifications_ListingExpiryAlerts_ListingExpiryAlertId",
                        column: x => x.ListingExpiryAlertId,
                        principalSchema: "notifications",
                        principalTable: "ListingExpiryAlerts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Notifications_OrganizationReviews_OrganizationReviewId",
                        column: x => x.OrganizationReviewId,
                        principalSchema: "donations",
                        principalTable: "OrganizationReviews",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Notifications_Reservations_ReservationId",
                        column: x => x.ReservationId,
                        principalSchema: "reservations",
                        principalTable: "Reservations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Notifications_Users_RecipientUserId",
                        column: x => x.RecipientUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ReservationDeliveries",
                schema: "reservations",
                columns: table => new
                {
                    ReservationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConfirmedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DeliveredAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReservationDeliveries", x => x.ReservationId);
                    table.CheckConstraint("CK_ReservationDeliveries_Utc", "([DeliveredAtUtc] IS NULL OR DATEPART(TZOFFSET, [DeliveredAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_ReservationDeliveries_Reservations_ReservationId",
                        column: x => x.ReservationId,
                        principalSchema: "reservations",
                        principalTable: "Reservations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ReservationDeliveries_Users_ConfirmedByUserId",
                        column: x => x.ConfirmedByUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ReservationStatusChanges",
                schema: "reservations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReservationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FromStatus = table.Column<int>(type: "int", nullable: true),
                    ToStatus = table.Column<int>(type: "int", nullable: false),
                    ActorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    OccurredAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReservationStatusChanges", x => x.Id);
                    table.CheckConstraint("CK_ReservationStatusChanges_Actor", "[ActorUserId] IS NOT NULL OR [ToStatus] = 4");
                    table.CheckConstraint("CK_ReservationStatusChanges_Reason_NotBlank", "LEN(LTRIM(RTRIM([Reason]))) > 0");
                    table.CheckConstraint("CK_ReservationStatusChanges_Transition", "([FromStatus] IS NULL AND [ToStatus] = 1) OR ([FromStatus] IS NOT NULL AND [FromStatus] = 1 AND [ToStatus] IN (2, 3, 4))");
                    table.CheckConstraint("CK_ReservationStatusChanges_Utc", "([OccurredAtUtc] IS NULL OR DATEPART(TZOFFSET, [OccurredAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_ReservationStatusChanges_Reservations_ReservationId",
                        column: x => x.ReservationId,
                        principalSchema: "reservations",
                        principalTable: "Reservations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ReservationStatusChanges_Users_ActorUserId",
                        column: x => x.ActorUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "StockAdjustments",
                schema: "listings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ListingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Kind = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    ReservationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DonationAcceptanceId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ActorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    OccurredAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockAdjustments", x => x.Id);
                    table.CheckConstraint("CK_StockAdjustments_Actor", "[ActorUserId] IS NOT NULL OR [Kind] = 3");
                    table.CheckConstraint("CK_StockAdjustments_Kind", "[Kind] IN (1, 2, 3)");
                    table.CheckConstraint("CK_StockAdjustments_Operation", "([ReservationId] IS NULL OR [DonationAcceptanceId] IS NULL) AND ([Kind] <> 1 OR ([ReservationId] IS NULL AND [DonationAcceptanceId] IS NULL))");
                    table.CheckConstraint("CK_StockAdjustments_Quantity", "[Quantity] > 0");
                    table.CheckConstraint("CK_StockAdjustments_Reason_NotBlank", "LEN(LTRIM(RTRIM([Reason]))) > 0");
                    table.CheckConstraint("CK_StockAdjustments_Utc", "([OccurredAtUtc] IS NULL OR DATEPART(TZOFFSET, [OccurredAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_StockAdjustments_DonationAcceptances_DonationAcceptanceId_ListingId",
                        columns: x => new { x.DonationAcceptanceId, x.ListingId },
                        principalSchema: "donations",
                        principalTable: "DonationAcceptances",
                        principalColumns: new[] { "Id", "ListingId" });
                    table.ForeignKey(
                        name: "FK_StockAdjustments_Listings_ListingId",
                        column: x => x.ListingId,
                        principalSchema: "listings",
                        principalTable: "Listings",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_StockAdjustments_Reservations_ReservationId_ListingId",
                        columns: x => new { x.ReservationId, x.ListingId },
                        principalSchema: "reservations",
                        principalTable: "Reservations",
                        principalColumns: new[] { "Id", "ListingId" });
                    table.ForeignKey(
                        name: "FK_StockAdjustments_Users_ActorUserId",
                        column: x => x.ActorUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "IncidentStatusChanges",
                schema: "administration",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IncidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FromStatus = table.Column<int>(type: "int", nullable: true),
                    ToStatus = table.Column<int>(type: "int", nullable: false),
                    ActorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    OccurredAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IncidentStatusChanges", x => x.Id);
                    table.CheckConstraint("CK_IncidentStatusChanges_Reason_NotBlank", "LEN(LTRIM(RTRIM([Reason]))) > 0");
                    table.CheckConstraint("CK_IncidentStatusChanges_Status", "[ToStatus] IN (1, 2, 3, 4) AND (([FromStatus] IS NULL AND [ToStatus] = 1) OR ([FromStatus] IS NOT NULL AND [FromStatus] IN (1, 2, 3, 4) AND [FromStatus] <> [ToStatus]))");
                    table.CheckConstraint("CK_IncidentStatusChanges_Utc", "([OccurredAtUtc] IS NULL OR DATEPART(TZOFFSET, [OccurredAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_IncidentStatusChanges_Incidents_IncidentId",
                        column: x => x.IncidentId,
                        principalSchema: "administration",
                        principalTable: "Incidents",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_IncidentStatusChanges_Users_ActorUserId",
                        column: x => x.ActorUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "NotificationOutboxMessages",
                schema: "notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NotificationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecipientUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DeviceRegistrationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Channel = table.Column<int>(type: "int", nullable: false),
                    Destination = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    AttemptCount = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    AvailableAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    LeaseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LeaseExpiresAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: true),
                    SentAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: true),
                    LastError = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationOutboxMessages", x => x.Id);
                    table.CheckConstraint("CK_NotificationOutboxMessages_Attempts", "[AttemptCount] >= 0");
                    table.CheckConstraint("CK_NotificationOutboxMessages_Available", "[AvailableAtUtc] >= [CreatedAtUtc]");
                    table.CheckConstraint("CK_NotificationOutboxMessages_Channel", "[Channel] IN (1, 2)");
                    table.CheckConstraint("CK_NotificationOutboxMessages_Destination", "([Channel] = 1 AND [DeviceRegistrationId] IS NULL AND [Destination] IS NOT NULL AND LEN(LTRIM(RTRIM([Destination]))) > 0) OR ([Channel] = 2 AND [DeviceRegistrationId] IS NOT NULL AND [Destination] IS NULL)");
                    table.CheckConstraint("CK_NotificationOutboxMessages_Lease", "([Status] = 2 AND [LeaseId] IS NOT NULL AND [LeaseExpiresAtUtc] IS NOT NULL AND [LeaseExpiresAtUtc] >= [CreatedAtUtc]) OR ([Status] IN (1, 3, 4) AND [LeaseId] IS NULL AND [LeaseExpiresAtUtc] IS NULL)");
                    table.CheckConstraint("CK_NotificationOutboxMessages_Sent", "([Status] = 3 AND [SentAtUtc] IS NOT NULL AND [SentAtUtc] >= [CreatedAtUtc]) OR ([Status] IN (1, 2, 4) AND [SentAtUtc] IS NULL)");
                    table.CheckConstraint("CK_NotificationOutboxMessages_Status", "[Status] IN (1, 2, 3, 4)");
                    table.CheckConstraint("CK_NotificationOutboxMessages_Utc", "([CreatedAtUtc] IS NULL OR DATEPART(TZOFFSET, [CreatedAtUtc]) = 0) AND ([AvailableAtUtc] IS NULL OR DATEPART(TZOFFSET, [AvailableAtUtc]) = 0) AND ([LeaseExpiresAtUtc] IS NULL OR DATEPART(TZOFFSET, [LeaseExpiresAtUtc]) = 0) AND ([SentAtUtc] IS NULL OR DATEPART(TZOFFSET, [SentAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_NotificationOutboxMessages_DeviceRegistrations_DeviceRegistrationId_RecipientUserId",
                        columns: x => new { x.DeviceRegistrationId, x.RecipientUserId },
                        principalSchema: "notifications",
                        principalTable: "DeviceRegistrations",
                        principalColumns: new[] { "Id", "UserId" });
                    table.ForeignKey(
                        name: "FK_NotificationOutboxMessages_Notifications_NotificationId_RecipientUserId",
                        columns: x => new { x.NotificationId, x.RecipientUserId },
                        principalSchema: "notifications",
                        principalTable: "Notifications",
                        principalColumns: new[] { "Id", "RecipientUserId" });
                });

            migrationBuilder.CreateTable(
                name: "NotificationDeliveryAttempts",
                schema: "notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OutboxMessageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AttemptNumber = table.Column<int>(type: "int", nullable: false),
                    Outcome = table.Column<int>(type: "int", nullable: false),
                    StartedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    FinishedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: true),
                    Error = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ProviderMessageId = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationDeliveryAttempts", x => x.Id);
                    table.CheckConstraint("CK_NotificationDeliveryAttempts_Number", "[AttemptNumber] > 0");
                    table.CheckConstraint("CK_NotificationDeliveryAttempts_Result", "([Outcome] = 1 AND [FinishedAtUtc] IS NULL AND [Error] IS NULL) OR ([Outcome] = 2 AND [FinishedAtUtc] IS NOT NULL AND [FinishedAtUtc] >= [StartedAtUtc] AND [Error] IS NULL) OR ([Outcome] = 3 AND [FinishedAtUtc] IS NOT NULL AND [FinishedAtUtc] >= [StartedAtUtc] AND [Error] IS NOT NULL AND LEN(LTRIM(RTRIM([Error]))) > 0)");
                    table.CheckConstraint("CK_NotificationDeliveryAttempts_Utc", "([StartedAtUtc] IS NULL OR DATEPART(TZOFFSET, [StartedAtUtc]) = 0) AND ([FinishedAtUtc] IS NULL OR DATEPART(TZOFFSET, [FinishedAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_NotificationDeliveryAttempts_NotificationOutboxMessages_OutboxMessageId",
                        column: x => x.OutboxMessageId,
                        principalSchema: "notifications",
                        principalTable: "NotificationOutboxMessages",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "UX_Users_NormalizedEmail",
                schema: "identity",
                table: "Users",
                column: "NormalizedEmail",
                unique: true,
                filter: "[NormalizedEmail] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AccountStatusChanges_ActorUserId",
                schema: "identity",
                table: "AccountStatusChanges",
                column: "ActorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountStatusChanges_UserId_OccurredAtUtc",
                schema: "identity",
                table: "AccountStatusChanges",
                columns: new[] { "UserId", "OccurredAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Name",
                schema: "listings",
                table: "Categories",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrations_InstallationId",
                schema: "notifications",
                table: "DeviceRegistrations",
                column: "InstallationId",
                unique: true,
                filter: "[RevokedAtUtc] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrations_Provider_TokenHash",
                schema: "notifications",
                table: "DeviceRegistrations",
                columns: new[] { "Provider", "TokenHash" },
                unique: true,
                filter: "[RevokedAtUtc] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceRegistrations_UserId_RevokedAtUtc",
                schema: "notifications",
                table: "DeviceRegistrations",
                columns: new[] { "UserId", "RevokedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_DonationAcceptances_AcceptedByUserId_IdempotencyKey",
                schema: "donations",
                table: "DonationAcceptances",
                columns: new[] { "AcceptedByUserId", "IdempotencyKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DonationAcceptances_ListingId_ListingMode",
                schema: "donations",
                table: "DonationAcceptances",
                columns: new[] { "ListingId", "ListingMode" });

            migrationBuilder.CreateIndex(
                name: "IX_DonationAcceptances_ListingId_Status",
                schema: "donations",
                table: "DonationAcceptances",
                columns: new[] { "ListingId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_DonationAcceptances_OrganizationId_CreatedAtUtc",
                schema: "donations",
                table: "DonationAcceptances",
                columns: new[] { "OrganizationId", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_DonationAcceptances_Status_PickupDeadlineUtc",
                schema: "donations",
                table: "DonationAcceptances",
                columns: new[] { "Status", "PickupDeadlineUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_DonationAcceptanceStatusChanges_ActorUserId",
                schema: "donations",
                table: "DonationAcceptanceStatusChanges",
                column: "ActorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DonationAcceptanceStatusChanges_DonationAcceptanceId_OccurredAtUtc",
                schema: "donations",
                table: "DonationAcceptanceStatusChanges",
                columns: new[] { "DonationAcceptanceId", "OccurredAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_DonationHandovers_ConfirmedByUserId",
                schema: "donations",
                table: "DonationHandovers",
                column: "ConfirmedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DonationHandovers_HandedOverAtUtc",
                schema: "donations",
                table: "DonationHandovers",
                column: "HandedOverAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_DonationReceipts_ReceivedAtUtc",
                schema: "donations",
                table: "DonationReceipts",
                column: "ReceivedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_DonationReceipts_ReceivedByUserId",
                schema: "donations",
                table: "DonationReceipts",
                column: "ReceivedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EstablishmentMembers_EstablishmentId_UserId",
                schema: "establishments",
                table: "EstablishmentMembers",
                columns: new[] { "EstablishmentId", "UserId" },
                unique: true,
                filter: "[RevokedAtUtc] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_EstablishmentMembers_GrantedByUserId",
                schema: "establishments",
                table: "EstablishmentMembers",
                column: "GrantedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EstablishmentMembers_RevokedByUserId",
                schema: "establishments",
                table: "EstablishmentMembers",
                column: "RevokedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EstablishmentMembers_UserId_RevokedAtUtc",
                schema: "establishments",
                table: "EstablishmentMembers",
                columns: new[] { "UserId", "RevokedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "UX_EstablishmentMembers_ActivePrimary",
                schema: "establishments",
                table: "EstablishmentMembers",
                column: "EstablishmentId",
                unique: true,
                filter: "[RevokedAtUtc] IS NULL AND [IsPrimary] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_Establishments_CreatedByUserId",
                schema: "establishments",
                table: "Establishments",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Establishments_Status_Latitude_Longitude",
                schema: "establishments",
                table: "Establishments",
                columns: new[] { "Status", "Latitude", "Longitude" });

            migrationBuilder.CreateIndex(
                name: "IX_EstablishmentStatusChanges_ActorUserId",
                schema: "establishments",
                table: "EstablishmentStatusChanges",
                column: "ActorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EstablishmentStatusChanges_EstablishmentId_OccurredAtUtc",
                schema: "establishments",
                table: "EstablishmentStatusChanges",
                columns: new[] { "EstablishmentId", "OccurredAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_AssignedToUserId",
                schema: "administration",
                table: "Incidents",
                column: "AssignedToUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_DonationAcceptanceId",
                schema: "administration",
                table: "Incidents",
                column: "DonationAcceptanceId");

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_ListingId",
                schema: "administration",
                table: "Incidents",
                column: "ListingId");

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_ReporterUserId_CreatedAtUtc",
                schema: "administration",
                table: "Incidents",
                columns: new[] { "ReporterUserId", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_ReservationId",
                schema: "administration",
                table: "Incidents",
                column: "ReservationId");

            migrationBuilder.CreateIndex(
                name: "IX_Incidents_Status_CreatedAtUtc",
                schema: "administration",
                table: "Incidents",
                columns: new[] { "Status", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_IncidentStatusChanges_ActorUserId",
                schema: "administration",
                table: "IncidentStatusChanges",
                column: "ActorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_IncidentStatusChanges_IncidentId_OccurredAtUtc",
                schema: "administration",
                table: "IncidentStatusChanges",
                columns: new[] { "IncidentId", "OccurredAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_ListingExpiryAlerts_ListingId_ThresholdMinutes",
                schema: "notifications",
                table: "ListingExpiryAlerts",
                columns: new[] { "ListingId", "ThresholdMinutes" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ListingFitnessChanges_ActorUserId",
                schema: "listings",
                table: "ListingFitnessChanges",
                column: "ActorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ListingFitnessChanges_ListingId_OccurredAtUtc",
                schema: "listings",
                table: "ListingFitnessChanges",
                columns: new[] { "ListingId", "OccurredAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Listings_CategoryId",
                schema: "listings",
                table: "Listings",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Listings_CreatedByUserId",
                schema: "listings",
                table: "Listings",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Listings_EstablishmentId_CreatedAtUtc",
                schema: "listings",
                table: "Listings",
                columns: new[] { "EstablishmentId", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Listings_Status_Mode_PickupDeadlineUtc",
                schema: "listings",
                table: "Listings",
                columns: new[] { "Status", "Mode", "PickupDeadlineUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_ListingStatusChanges_ActorUserId",
                schema: "listings",
                table: "ListingStatusChanges",
                column: "ActorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ListingStatusChanges_ListingId_OccurredAtUtc",
                schema: "listings",
                table: "ListingStatusChanges",
                columns: new[] { "ListingId", "OccurredAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_NotificationDeliveryAttempts_OutboxMessageId_AttemptNumber",
                schema: "notifications",
                table: "NotificationDeliveryAttempts",
                columns: new[] { "OutboxMessageId", "AttemptNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NotificationOutboxMessages_DeviceRegistrationId_RecipientUserId",
                schema: "notifications",
                table: "NotificationOutboxMessages",
                columns: new[] { "DeviceRegistrationId", "RecipientUserId" });

            migrationBuilder.CreateIndex(
                name: "IX_NotificationOutboxMessages_NotificationId_Channel",
                schema: "notifications",
                table: "NotificationOutboxMessages",
                columns: new[] { "NotificationId", "Channel" },
                unique: true,
                filter: "[DeviceRegistrationId] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationOutboxMessages_NotificationId_Channel_DeviceRegistrationId",
                schema: "notifications",
                table: "NotificationOutboxMessages",
                columns: new[] { "NotificationId", "Channel", "DeviceRegistrationId" },
                unique: true,
                filter: "[DeviceRegistrationId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationOutboxMessages_NotificationId_RecipientUserId",
                schema: "notifications",
                table: "NotificationOutboxMessages",
                columns: new[] { "NotificationId", "RecipientUserId" });

            migrationBuilder.CreateIndex(
                name: "IX_NotificationOutboxMessages_Status_AvailableAtUtc",
                schema: "notifications",
                table: "NotificationOutboxMessages",
                columns: new[] { "Status", "AvailableAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_NotificationOutboxMessages_Status_LeaseExpiresAtUtc",
                schema: "notifications",
                table: "NotificationOutboxMessages",
                columns: new[] { "Status", "LeaseExpiresAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_DonationAcceptanceId",
                schema: "notifications",
                table: "Notifications",
                column: "DonationAcceptanceId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_ListingExpiryAlertId",
                schema: "notifications",
                table: "Notifications",
                column: "ListingExpiryAlertId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_OrganizationReviewId",
                schema: "notifications",
                table: "Notifications",
                column: "OrganizationReviewId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RecipientUserId_CreatedAtUtc",
                schema: "notifications",
                table: "Notifications",
                columns: new[] { "RecipientUserId", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RecipientUserId_EventKey",
                schema: "notifications",
                table: "Notifications",
                columns: new[] { "RecipientUserId", "EventKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RecipientUserId_ReadAtUtc",
                schema: "notifications",
                table: "Notifications",
                columns: new[] { "RecipientUserId", "ReadAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_ReservationId",
                schema: "notifications",
                table: "Notifications",
                column: "ReservationId");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationMembers_GrantedByUserId",
                schema: "donations",
                table: "OrganizationMembers",
                column: "GrantedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationMembers_OrganizationId_UserId",
                schema: "donations",
                table: "OrganizationMembers",
                columns: new[] { "OrganizationId", "UserId" },
                unique: true,
                filter: "[RevokedAtUtc] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationMembers_RevokedByUserId",
                schema: "donations",
                table: "OrganizationMembers",
                column: "RevokedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationMembers_UserId_RevokedAtUtc",
                schema: "donations",
                table: "OrganizationMembers",
                columns: new[] { "UserId", "RevokedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "UX_OrganizationMembers_ActivePrimary",
                schema: "donations",
                table: "OrganizationMembers",
                column: "OrganizationId",
                unique: true,
                filter: "[RevokedAtUtc] IS NULL AND [IsPrimary] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationReviews_OrganizationId_ReviewedAtUtc",
                schema: "donations",
                table: "OrganizationReviews",
                columns: new[] { "OrganizationId", "ReviewedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationReviews_ReviewerUserId",
                schema: "donations",
                table: "OrganizationReviews",
                column: "ReviewerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_CreatedByUserId",
                schema: "donations",
                table: "Organizations",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Organizations_VerificationStatus_CreatedAtUtc",
                schema: "donations",
                table: "Organizations",
                columns: new[] { "VerificationStatus", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_ReservationDeliveries_ConfirmedByUserId",
                schema: "reservations",
                table: "ReservationDeliveries",
                column: "ConfirmedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ReservationDeliveries_DeliveredAtUtc",
                schema: "reservations",
                table: "ReservationDeliveries",
                column: "DeliveredAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_ConsumerUserId_CreatedAtUtc",
                schema: "reservations",
                table: "Reservations",
                columns: new[] { "ConsumerUserId", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_ConsumerUserId_IdempotencyKey",
                schema: "reservations",
                table: "Reservations",
                columns: new[] { "ConsumerUserId", "IdempotencyKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_ListingId_ListingMode",
                schema: "reservations",
                table: "Reservations",
                columns: new[] { "ListingId", "ListingMode" });

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_ListingId_Status",
                schema: "reservations",
                table: "Reservations",
                columns: new[] { "ListingId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_PickupReference",
                schema: "reservations",
                table: "Reservations",
                column: "PickupReference",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_Status_PickupDeadlineUtc",
                schema: "reservations",
                table: "Reservations",
                columns: new[] { "Status", "PickupDeadlineUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_ReservationStatusChanges_ActorUserId",
                schema: "reservations",
                table: "ReservationStatusChanges",
                column: "ActorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ReservationStatusChanges_ReservationId_OccurredAtUtc",
                schema: "reservations",
                table: "ReservationStatusChanges",
                columns: new[] { "ReservationId", "OccurredAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_StockAdjustments_ActorUserId",
                schema: "listings",
                table: "StockAdjustments",
                column: "ActorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_StockAdjustments_DonationAcceptanceId",
                schema: "listings",
                table: "StockAdjustments",
                column: "DonationAcceptanceId",
                unique: true,
                filter: "[DonationAcceptanceId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_StockAdjustments_DonationAcceptanceId_ListingId",
                schema: "listings",
                table: "StockAdjustments",
                columns: new[] { "DonationAcceptanceId", "ListingId" });

            migrationBuilder.CreateIndex(
                name: "IX_StockAdjustments_ListingId_Kind_OccurredAtUtc",
                schema: "listings",
                table: "StockAdjustments",
                columns: new[] { "ListingId", "Kind", "OccurredAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_StockAdjustments_ReservationId",
                schema: "listings",
                table: "StockAdjustments",
                column: "ReservationId",
                unique: true,
                filter: "[ReservationId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_StockAdjustments_ReservationId_ListingId",
                schema: "listings",
                table: "StockAdjustments",
                columns: new[] { "ReservationId", "ListingId" });

            migrationBuilder.CreateIndex(
                name: "IX_StockTransfers_ActorUserId",
                schema: "listings",
                table: "StockTransfers",
                column: "ActorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_StockTransfers_DestinationListingId_EstablishmentId_DestinationMode",
                schema: "listings",
                table: "StockTransfers",
                columns: new[] { "DestinationListingId", "EstablishmentId", "DestinationMode" });

            migrationBuilder.CreateIndex(
                name: "IX_StockTransfers_DestinationListingId_OccurredAtUtc",
                schema: "listings",
                table: "StockTransfers",
                columns: new[] { "DestinationListingId", "OccurredAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_StockTransfers_SourceListingId_EstablishmentId_SourceMode",
                schema: "listings",
                table: "StockTransfers",
                columns: new[] { "SourceListingId", "EstablishmentId", "SourceMode" });

            migrationBuilder.CreateIndex(
                name: "IX_StockTransfers_SourceListingId_OccurredAtUtc",
                schema: "listings",
                table: "StockTransfers",
                columns: new[] { "SourceListingId", "OccurredAtUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccountStatusChanges",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "DonationAcceptanceStatusChanges",
                schema: "donations");

            migrationBuilder.DropTable(
                name: "DonationHandovers",
                schema: "donations");

            migrationBuilder.DropTable(
                name: "DonationReceipts",
                schema: "donations");

            migrationBuilder.DropTable(
                name: "EstablishmentMembers",
                schema: "establishments");

            migrationBuilder.DropTable(
                name: "EstablishmentStatusChanges",
                schema: "establishments");

            migrationBuilder.DropTable(
                name: "IncidentStatusChanges",
                schema: "administration");

            migrationBuilder.DropTable(
                name: "ListingFitnessChanges",
                schema: "listings");

            migrationBuilder.DropTable(
                name: "ListingStatusChanges",
                schema: "listings");

            migrationBuilder.DropTable(
                name: "NotificationDeliveryAttempts",
                schema: "notifications");

            migrationBuilder.DropTable(
                name: "OrganizationMembers",
                schema: "donations");

            migrationBuilder.DropTable(
                name: "ReservationDeliveries",
                schema: "reservations");

            migrationBuilder.DropTable(
                name: "ReservationStatusChanges",
                schema: "reservations");

            migrationBuilder.DropTable(
                name: "StockAdjustments",
                schema: "listings");

            migrationBuilder.DropTable(
                name: "StockTransfers",
                schema: "listings");

            migrationBuilder.DropTable(
                name: "AccountProfiles",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "Incidents",
                schema: "administration");

            migrationBuilder.DropTable(
                name: "NotificationOutboxMessages",
                schema: "notifications");

            migrationBuilder.DropTable(
                name: "DeviceRegistrations",
                schema: "notifications");

            migrationBuilder.DropTable(
                name: "Notifications",
                schema: "notifications");

            migrationBuilder.DropTable(
                name: "DonationAcceptances",
                schema: "donations");

            migrationBuilder.DropTable(
                name: "ListingExpiryAlerts",
                schema: "notifications");

            migrationBuilder.DropTable(
                name: "OrganizationReviews",
                schema: "donations");

            migrationBuilder.DropTable(
                name: "Reservations",
                schema: "reservations");

            migrationBuilder.DropTable(
                name: "Organizations",
                schema: "donations");

            migrationBuilder.DropTable(
                name: "Listings",
                schema: "listings");

            migrationBuilder.DropTable(
                name: "Categories",
                schema: "listings");

            migrationBuilder.DropTable(
                name: "Establishments",
                schema: "establishments");

            migrationBuilder.DropIndex(
                name: "UX_Users_NormalizedEmail",
                schema: "identity",
                table: "Users");
        }
    }
}
