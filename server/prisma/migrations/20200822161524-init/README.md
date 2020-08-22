# Migration `20200822161524-init`

This migration has been generated at 8/22/2020, 4:15:24 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."SyncRequest" (
"id" SERIAL,
"userId" text   NOT NULL ,
"coursesFound" integer   ,
"coursesAdded" integer   ,
"error" text   ,
PRIMARY KEY ("id")
)

ALTER TABLE "public"."SyncRequest" ADD FOREIGN KEY ("userId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200822121243-init..20200822161524-init
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
@@ -15,5 +15,14 @@
 model Course {
   name String @id
   updatedAt DateTime @updatedAt
-}
+}
+
+model SyncRequest {
+  id Int @id @default(autoincrement())
+  user User @relation(fields: [userId], references: [id])
+  userId String
+  coursesFound Int?
+  coursesAdded Int?
+  error String?
+}
```


