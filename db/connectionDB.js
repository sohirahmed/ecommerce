import mongoose from "mongoose";

const connectionDB = async () => {
  const uri = process.env.DB_URL_Online || process.env.DB_URL;

  return await mongoose
    .connect(uri)
    .then(() => console.log("connected to database"))
    .catch((err) => console.log("fail to connect", err));
};

export default connectionDB;