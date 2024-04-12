import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("databse connected successfuly");
    });
    mongoose.connection.on("error", (err) => {
      console.log("database get disconnected in between", err);
    });
    await mongoose.connect(
      "mongodb+srv://balajimahraaj123:YL0tOGFcwvQ57SyE@cluster0.aqh4b1w.mongodb.net/UserRoutes"
    );
  } catch (err) {
    console.log(err);
    console.log("failed to connect database");
    process.exit(1);
  }
};

export default connectDB;
