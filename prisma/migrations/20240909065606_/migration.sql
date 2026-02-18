/*
  Warnings:

  - The primary key for the `User_table_column_permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id` on the `User_table_column_permissions` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User_table_column_permissions" (
    "User_id" INTEGER NOT NULL,
    "Datasource_id" INTEGER NOT NULL,
    "Database_id" INTEGER NOT NULL,
    "Table_id" INTEGER NOT NULL,
    "Column_id" INTEGER NOT NULL,
    "permissionFlags" INTEGER NOT NULL,

    PRIMARY KEY ("User_id", "Datasource_id", "Database_id", "Table_id", "Column_id"),
    CONSTRAINT "User_table_column_permissions_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "User_table_column_permissions_Datasource_id_fkey" FOREIGN KEY ("Datasource_id") REFERENCES "DataSource" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "User_table_column_permissions_Database_id_fkey" FOREIGN KEY ("Database_id") REFERENCES "DatabaseEntity" ("Id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "User_table_column_permissions_Table_id_fkey" FOREIGN KEY ("Table_id") REFERENCES "DatabaseTable" ("Id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "User_table_column_permissions_Column_id_fkey" FOREIGN KEY ("Column_id") REFERENCES "DatabaseColumn" ("Id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_User_table_column_permissions" ("Column_id", "Database_id", "Datasource_id", "Table_id", "User_id", "permissionFlags") SELECT "Column_id", "Database_id", "Datasource_id", "Table_id", "User_id", "permissionFlags" FROM "User_table_column_permissions";
DROP TABLE "User_table_column_permissions";
ALTER TABLE "new_User_table_column_permissions" RENAME TO "User_table_column_permissions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
