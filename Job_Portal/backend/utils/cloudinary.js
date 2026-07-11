import { v2 as cloudinary } from "cloudinary";

// Do NOT call dotenv.config() here — env vars are already injected
// by Docker (env_file) or by index.js before this module is used.
// Configuring here at module load time caused API_KEY to be undefined.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY || process.env.API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET,
});

export default cloudinary;
