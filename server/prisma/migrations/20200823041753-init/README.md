# Migration `20200823041753-init`

This migration has been generated at 8/23/2020, 4:17:53 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
DROP TABLE "public"."Course"
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200822222320-init..20200823041753-init
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
@@ -12,13 +12,8 @@
   accessToken String
   refreshToken String?
 }
-model Course {
-  name String @id
-  updatedAt DateTime @updatedAt
-}
-
 model SyncRequest {
   id Int @id @default(autoincrement())
   user User @relation(fields: [userId], references: [id])
   createdAt DateTime @default(now())
```


