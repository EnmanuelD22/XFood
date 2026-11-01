using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace XFood.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AuditHu01Edits : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EstablishmentProfileRevisions",
                schema: "establishments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EstablishmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OccurredAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    BeforeJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AfterJson = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstablishmentProfileRevisions", x => x.Id);
                    table.CheckConstraint("CK_EstablishmentProfileRevisions_AfterJson", "ISJSON([AfterJson]) = 1");
                    table.CheckConstraint("CK_EstablishmentProfileRevisions_BeforeJson", "ISJSON([BeforeJson]) = 1");
                    table.CheckConstraint("CK_EstablishmentProfileRevisions_Utc", "([OccurredAtUtc] IS NULL OR DATEPART(TZOFFSET, [OccurredAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_EstablishmentProfileRevisions_Establishments_EstablishmentId",
                        column: x => x.EstablishmentId,
                        principalSchema: "establishments",
                        principalTable: "Establishments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EstablishmentProfileRevisions_Users_ActorUserId",
                        column: x => x.ActorUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ListingRevisions",
                schema: "listings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ListingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OccurredAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset(3)", precision: 3, nullable: false),
                    BeforeJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AfterJson = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListingRevisions", x => x.Id);
                    table.CheckConstraint("CK_ListingRevisions_AfterJson", "ISJSON([AfterJson]) = 1");
                    table.CheckConstraint("CK_ListingRevisions_BeforeJson", "ISJSON([BeforeJson]) = 1");
                    table.CheckConstraint("CK_ListingRevisions_Utc", "([OccurredAtUtc] IS NULL OR DATEPART(TZOFFSET, [OccurredAtUtc]) = 0)");
                    table.ForeignKey(
                        name: "FK_ListingRevisions_Listings_ListingId",
                        column: x => x.ListingId,
                        principalSchema: "listings",
                        principalTable: "Listings",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ListingRevisions_Users_ActorUserId",
                        column: x => x.ActorUserId,
                        principalSchema: "identity",
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_EstablishmentProfileRevisions_ActorUserId",
                schema: "establishments",
                table: "EstablishmentProfileRevisions",
                column: "ActorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EstablishmentProfileRevisions_EstablishmentId_OccurredAtUtc",
                schema: "establishments",
                table: "EstablishmentProfileRevisions",
                columns: new[] { "EstablishmentId", "OccurredAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_ListingRevisions_ActorUserId",
                schema: "listings",
                table: "ListingRevisions",
                column: "ActorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ListingRevisions_ListingId_OccurredAtUtc",
                schema: "listings",
                table: "ListingRevisions",
                columns: new[] { "ListingId", "OccurredAtUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EstablishmentProfileRevisions",
                schema: "establishments");

            migrationBuilder.DropTable(
                name: "ListingRevisions",
                schema: "listings");
        }
    }
}
