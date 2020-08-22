# Migration `20200822222320-init`

This migration has been generated at 8/22/2020, 10:23:20 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."SyncRequest" ADD COLUMN "createdAt" timestamp(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200822161524-init..20200822222320-init
--- datamodel.dml
+++ datamodel.dml
@@ -1,7 +1,7 @@
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 generator client {
   provider = "prisma-client-js"
@@ -20,8 +20,9 @@
 model SyncRequest {
   id Int @id @default(autoincrement())
   user User @relation(fields: [userId], references: [id])
+  createdAt DateTime @default(now())
   userId String
   coursesFound Int?
   coursesAdded Int?
   error String?
```


