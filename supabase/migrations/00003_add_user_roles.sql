-- Migration to add 'role' column to user_profiles table

-- 1. Add the column with a default value of 'user'
ALTER TABLE "public"."user_profiles" 
ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'user' NOT NULL;

-- 2. Validate the role contains valid assignments (optional constraint)
ALTER TABLE "public"."user_profiles"
ADD CONSTRAINT check_user_role CHECK (role IN ('user', 'super_admin'));

-- Note: To make an existing user a super admin, run the following command in the SQL editor:
-- UPDATE "public"."user_profiles" SET role = 'super_admin' WHERE user_id = 'your_email@example.com';
