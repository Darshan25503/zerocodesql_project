/*
  Warnings:

  - You are about to drop the column `Hits` on the `ApiEntity` table. All the data in the column will be lost.
  - Added the required column `Permissions` to the `ApiEntity` table without a default value. This is not possible if the table is not empty.

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
    "Datasource_id" INTEGER NOT NULL,
    "Database_id" INTEGER NOT NULL,
    "Table_id" INTEGER NOT NULL,
    CONSTRAINT "ApiEntity_Datasource_id_fkey" FOREIGN KEY ("Datasource_id") REFERENCES "DataSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ApiEntity_Database_id_fkey" FOREIGN KEY ("Database_id") REFERENCES "DatabaseEntity" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ApiEntity_Table_id_fkey" FOREIGN KEY ("Table_id") REFERENCES "DatabaseTable" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ApiEntity" ("Database_id", "Datasource_id", "Display", "Enabled", "Id", "Name", "Table_id") SELECT "Database_id", "Datasource_id", "Display", "Enabled", "Id", "Name", "Table_id" FROM "ApiEntity";
DROP TABLE "ApiEntity";
ALTER TABLE "new_ApiEntity" RENAME TO "ApiEntity";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
