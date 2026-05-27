import { v2 as cloudinary } from "cloudinary";

// Do NOT call dotenv.config() here — env vars are already injected
// by Docker (env_file) or by index.js before this module is used.
// Configuring here at module load time caused API_KEY to be undefined.
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

export default cloudinary;
