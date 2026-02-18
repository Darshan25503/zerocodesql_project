/*
  Warnings:

  - You are about to drop the column `Description` on the `FormField` table. All the data in the column will be lost.
  - Added the required column `DescriptionOrValue` to the `FormField` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Visible` to the `FormField` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FormField" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Form_id" INTEGER NOT NULL,
    "Datasource_id" INTEGER NOT NULL,
    "Database_id" INTEGER NOT NULL,
    "Table_id" INTEGER NOT NULL,
    "Column_id" INTEGER NOT NULL,
    "Visible" BOOLEAN NOT NULL,
    "DescriptionOrValue" TEXT NOT NULL,
    "Order" INTEGER NOT NULL,
    CONSTRAINT "FormField_Form_id_fkey" FOREIGN KEY ("Form_id") REFERENCES "Form" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FormField_Datasource_id_fkey" FOREIGN KEY ("Datasource_id") REFERENCES "DataSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FormField_Database_id_fkey" FOREIGN KEY ("Database_id") REFERENCES "DatabaseEntity" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FormField_Table_id_fkey" FOREIGN KEY ("Table_id") REFERENCES "DatabaseTable" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FormField_Column_id_fkey" FOREIGN KEY ("Column_id") REFERENCES "DatabaseColumn" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FormField" ("Column_id", "Database_id", "Datasource_id", "Form_id", "Id", "Order", "Table_id") SELECT "Column_id", "Database_id", "Datasource_id", "Form_id", "Id", "Order", "Table_id" FROM "FormField";
DROP TABLE "FormField";
ALTER TABLE "new_FormField" RENAME TO "FormField";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
