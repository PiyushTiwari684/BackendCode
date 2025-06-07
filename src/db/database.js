import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async()=>{
    try {
       let client = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
    //    console.log(client);
       console.log(`mongodb connected db host ${client.connection.host}`);

    } catch (err) {
        console.log("MONGODB Err", err);
        process.exit(1);    
    }
}

export default connectDB;
// connectDB();

