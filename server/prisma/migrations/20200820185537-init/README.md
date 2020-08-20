# Migration `20200820185537-init`

This migration has been generated at 8/20/2020, 6:55:37 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."User" (
"id" text   NOT NULL ,
"accessToken" text   NOT NULL ,
"refreshToken" text   ,
PRIMARY KEY ("id")
)
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration ..20200820185537-init
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,17 @@
+// This is your Prisma schema file,
+// learn more about it in the docs: https://pris.ly/d/prisma-schema
+
+datasource db {
+  provider = "postgresql"
+  url = "***"
+}
+
+generator client {
+  provider = "prisma-client-js"
+}
+
+model User {
+  id String @id
+  accessToken String
+  refreshToken String?
+}
```


