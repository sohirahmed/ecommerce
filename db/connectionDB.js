import mongoose from "mongoose";

const connectionDB = async () => {
  return await mongoose
    .connect(process.env.DB_URL_Online)
    .then(() => {
      console.log(`connected to database`);
    })
    .catch((err) => {
      console.log("fail to connect", err);
    });
};

export default connectionDB;
