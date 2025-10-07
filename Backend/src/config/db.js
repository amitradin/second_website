import mongoose from "mongoose";

//trying to connect to db
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected succesfully");
  } catch (error) {
    console.log("Could not connect to db" , error);
    process.exit(1);
  }
};
