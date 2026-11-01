using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace XFood.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedInitialCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var approvedAtUtc = new DateTimeOffset(2026, 11, 1, 0, 0, 0, TimeSpan.Zero);
            migrationBuilder.InsertData(
                schema: "listings", table: "Categories",
                columns: new[] { "Id", "Name", "IsActive", "CreatedAtUtc" },
                values: new object[,]
                {
                    { new Guid("68de952d-7dd1-4379-bf75-1d23d6c22d41"), "Comidas preparadas", true, approvedAtUtc },
                    { new Guid("050c7350-1685-4013-a87e-d90a888d0670"), "Panadería y repostería", true, approvedAtUtc },
                    { new Guid("49130876-893d-4204-9b94-4a588d487544"), "Frutas y verduras", true, approvedAtUtc },
                    { new Guid("57acbe83-c922-4b84-8afc-393c032d7055"), "Lácteos y huevos", true, approvedAtUtc },
                    { new Guid("6ccab297-9905-4751-9ac8-5ca3bde545e0"), "Carnes y pescados", true, approvedAtUtc },
                    { new Guid("ca4a3ade-7c7c-4edb-a922-1b50a10b2313"), "Alimentos envasados", true, approvedAtUtc },
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Foreign keys from Listings prevent removing categories that are already in use.
            migrationBuilder.DeleteData(schema: "listings", table: "Categories", keyColumn: "Id", keyValue: new Guid("68de952d-7dd1-4379-bf75-1d23d6c22d41"));
            migrationBuilder.DeleteData(schema: "listings", table: "Categories", keyColumn: "Id", keyValue: new Guid("050c7350-1685-4013-a87e-d90a888d0670"));
            migrationBuilder.DeleteData(schema: "listings", table: "Categories", keyColumn: "Id", keyValue: new Guid("49130876-893d-4204-9b94-4a588d487544"));
            migrationBuilder.DeleteData(schema: "listings", table: "Categories", keyColumn: "Id", keyValue: new Guid("57acbe83-c922-4b84-8afc-393c032d7055"));
            migrationBuilder.DeleteData(schema: "listings", table: "Categories", keyColumn: "Id", keyValue: new Guid("6ccab297-9905-4751-9ac8-5ca3bde545e0"));
            migrationBuilder.DeleteData(schema: "listings", table: "Categories", keyColumn: "Id", keyValue: new Guid("ca4a3ade-7c7c-4edb-a922-1b50a10b2313"));
        }
    }
}
