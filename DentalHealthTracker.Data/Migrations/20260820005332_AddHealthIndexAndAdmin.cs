using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DentalHealthTracker.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddHealthIndexAndAdmin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BrushedTeeth",
                table: "HabitRecords");

            migrationBuilder.DropColumn(
                name: "Flossed",
                table: "HabitRecords");

            migrationBuilder.DropColumn(
                name: "UsedMouthwash",
                table: "HabitRecords");

            migrationBuilder.AddColumn<bool>(
                name: "IsAdmin",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsBanned",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "BrushingCount",
                table: "HabitRecords",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FlossingCount",
                table: "HabitRecords",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MouthwashCount",
                table: "HabitRecords",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAdmin",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsBanned",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "BrushingCount",
                table: "HabitRecords");

            migrationBuilder.DropColumn(
                name: "FlossingCount",
                table: "HabitRecords");

            migrationBuilder.DropColumn(
                name: "MouthwashCount",
                table: "HabitRecords");

            migrationBuilder.AddColumn<bool>(
                name: "BrushedTeeth",
                table: "HabitRecords",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Flossed",
                table: "HabitRecords",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "UsedMouthwash",
                table: "HabitRecords",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
