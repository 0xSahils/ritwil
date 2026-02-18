-- AlterTable: VBID unique per profile (multiple NULLs allowed in PostgreSQL)
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_vbid_key" UNIQUE ("vbid");
