-- Add optional single-vehicle fields to Visitor
ALTER TABLE "Visitor"
  ADD COLUMN "vehiclePlateEncrypted" TEXT,
  ADD COLUMN "vehicleBrandModel" TEXT,
  ADD COLUMN "vehicleColor" TEXT;
