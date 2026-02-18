/*
  Warnings:

  - Made the column `Name` on table `DataSource` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DataSource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Name" TEXT NOT NULL,
    "databaseType" TEXT NOT NULL,
    "Host" TEXT,
    "User" TEXT,
    "Password" TEXT,
    "Database" TEXT,
    "Port" INTEGER,
    "proxyUser" TEXT,
    "proxyHost" TEXT,
    "proxyPort" INTEGER,
    "proxyAuthenticationType" TEXT,
    "proxyAuthenticationData" TEXT,
    "Filename" TEXT,
    "Flags" TEXT
);
INSERT INTO "new_DataSource" ("Database", "Filename", "Flags", "Host", "Name", "Password", "Port", "User", "databaseType", "id", "proxyAuthenticationData", "proxyAuthenticationType", "proxyHost", "proxyPort", "proxyUser") SELECT "Database", "Filename", "Flags", "Host", "Name", "Password", "Port", "User", "databaseType", "id", "proxyAuthenticationData", "proxyAuthenticationType", "proxyHost", "proxyPort", "proxyUser" FROM "DataSource";
DROP TABLE "DataSource";
ALTER TABLE "new_DataSource" RENAME TO "DataSource";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
