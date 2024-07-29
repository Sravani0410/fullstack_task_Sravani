import mongoose from "mongoose";
import { createClient } from "redis";

const redisClient = createClient({
  url: "redis://default:dssYpBnYQrl01GbCGVhVq2e4dYvUrKJB@redis-12675.c212.ap-south-1-1.ec2.cloud.redislabs.com:12675",
});

redisClient.connect().catch(console.error);

const mongooseOptions: any = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(
    "mongodb+srv://assignment_user:HCgEj5zv8Hxwa4xO@cluster0.pir4n5b.mongodb.net/assignment?retryWrites=true&w=majority&appName=Cluster0",
    mongooseOptions
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

export { mongoose, redisClient };
