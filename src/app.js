import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "15kb" }));
app.use(express.urlencoded({ extended: true, limit: "15kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js"; // userRouter can be named anything
import tweetRouter from "./routes/tweet.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweets", tweetRouter);

export { app };
