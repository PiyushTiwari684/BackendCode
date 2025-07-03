import connectDB from "./db/database.js";
import app from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server running at PORT :${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongo db connnection failed", err);
  });

// import dotenv from "dotenv";
// import connectDB from "./db/index.js";
// // import { app } from "./app.js";
// dotenv.config({
//   path: "./.env",
// });

// connectDB();
