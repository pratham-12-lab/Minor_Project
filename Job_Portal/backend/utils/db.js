import mongoose from "mongoose";
import seedAdminAccount from "./seedAdmin.js";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('mongodb connected successfully');
        if (process.env.NODE_ENV !== 'test') {
            await seedAdminAccount();
        }
    } catch (error) {
        console.log(error);
    }
}
export default connectDB;