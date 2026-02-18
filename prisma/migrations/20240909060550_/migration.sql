/*
  Warnings:

  - Added the required column `UserId` to the `ApiEntity` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ApiEntity" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Name" TEXT NOT NULL,
    "Display" TEXT NOT NULL,
    "Permissions" INTEGER NOT NULL,
    "Enabled" BOOLEAN NOT NULL,
    "ApiKey" TEXT NOT NULL,
    "UserId" INTEGER NOT NULL,
    "Datasource_id" INTEGER NOT NULL,
    "Database_id" INTEGER NOT NULL,
    "Table_id" INTEGER NOT NULL,
    CONSTRAINT "ApiEntity_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApiEntity_Datasource_id_fkey" FOREIGN KEY ("Datasource_id") REFERENCES "DataSource" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApiEntity_Database_id_fkey" FOREIGN KEY ("Database_id") REFERENCES "DatabaseEntity" ("Id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApiEntity_Table_id_fkey" FOREIGN KEY ("Table_id") REFERENCES "DatabaseTable" ("Id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ApiEntity" ("ApiKey", "Database_id", "Datasource_id", "Display", "Enabled", "Id", "Name", "Permissions", "Table_id") SELECT "ApiKey", "Database_id", "Datasource_id", "Display", "Enabled", "Id", "Name", "Permissions", "Table_id" FROM "ApiEntity";
DROP TABLE "ApiEntity";
ALTER TABLE "new_ApiEntity" RENAME TO "ApiEntity";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
