-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DatabaseColumn" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Table_id" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "Display" TEXT NOT NULL,
    "DataType" TEXT NOT NULL,
    "Order" INTEGER NOT NULL,
    "isPrimaryKey" BOOLEAN NOT NULL,
    "ForeignKeyId" INTEGER,
    "ForeignKeyDisplayId" INTEGER,
    CONSTRAINT "DatabaseColumn_Table_id_fkey" FOREIGN KEY ("Table_id") REFERENCES "DatabaseTable" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DatabaseColumn_ForeignKeyId_fkey" FOREIGN KEY ("ForeignKeyId") REFERENCES "DatabaseColumn" ("Id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DatabaseColumn_ForeignKeyDisplayId_fkey" FOREIGN KEY ("ForeignKeyDisplayId") REFERENCES "DatabaseColumn" ("Id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_DatabaseColumn" ("DataType", "Display", "ForeignKeyId", "Id", "Name", "Order", "Table_id", "isPrimaryKey") SELECT "DataType", "Display", "ForeignKeyId", "Id", "Name", "Order", "Table_id", "isPrimaryKey" FROM "DatabaseColumn";
DROP TABLE "DatabaseColumn";
ALTER TABLE "new_DatabaseColumn" RENAME TO "DatabaseColumn";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
