import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import dns from "dns";

// Fix SRV record DNS resolution on Windows
try {
  dns.setServers(["1.1.1.1", "8.8.8.8", "0.0.0.0"]);
} catch (e) {
  // Ignore if dns setting is not permitted in environment
}

/**
 * Ensures a one-time administrator account exists in the database.
 * If an admin account already exists, it is preserved without modification.
 * If no admin account exists, a designated admin account is initialized
 * using credentials from environment variables or secure defaults.
 *
 * @param {Object} options
 * @param {boolean} [options.forceReset=false] Whether to reset password if admin already exists
 * @returns {Promise<Object>} The admin user document
 */
export const seedAdminAccount = async (options = {}) => {
  try {
    const { forceReset = false } = options;

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@jobportal.com").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
    const adminFullname = process.env.ADMIN_NAME || "System Administrator";
    const adminPhone = Number(process.env.ADMIN_PHONE) || 9999999999;

    // Check if designated admin account already exists
    const existingAdminByEmail = await User.findOne({ email: adminEmail });

    if (existingAdminByEmail) {
      if (forceReset) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        existingAdminByEmail.password = hashedPassword;
        existingAdminByEmail.role = "admin";
        existingAdminByEmail.isVerified = true;
        existingAdminByEmail.verificationStatus = "approved";
        await existingAdminByEmail.save();
        console.log(`🔄 Designated admin account (${adminEmail}) password reset successfully.`);
        return existingAdminByEmail;
      }

      console.log(`ℹ️ Designated admin account already exists (${adminEmail}).`);
      return existingAdminByEmail;
    }

    // Create the designated one-time admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const newAdmin = await User.create({
      fullname: adminFullname,
      email: adminEmail,
      phoneNumber: adminPhone,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      verificationStatus: "approved",
    });

    console.log("==================================================");
    console.log("🛡️ ONE-TIME ADMIN ACCOUNT INITIALIZED");
    console.log(`👤 Name:     ${adminFullname}`);
    console.log(`📧 Email:    ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`👑 Role:     admin`);
    console.log("==================================================");

    return newAdmin;
  } catch (error) {
    console.error("❌ Error initializing admin account:", error.message);
    throw error;
  }
};

// Allow running directly via CLI (e.g. `node utils/seedAdmin.js` or `npm run seed:admin`)
const __filename = fileURLToPath(import.meta.url);
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectRun) {
  dotenv.config();
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("❌ MONGO_URI environment variable is required.");
    process.exit(1);
  }

  const forceReset = process.argv.includes("--reset") || process.argv.includes("--force");

  mongoose
    .connect(mongoUri)
    .then(async () => {
      console.log("Connecting to MongoDB to seed admin account...");
      await seedAdminAccount({ forceReset });
      await mongoose.disconnect();
      console.log("Database disconnected. Admin initialization complete.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error during admin seed execution:", err);
      process.exit(1);
    });
}

export default seedAdminAccount;
