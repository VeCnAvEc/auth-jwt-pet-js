import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import express from "express";

import app from "./app";
import authRouter from "./routes/auth.routes";
import errorMiddleware from "./middlewares/error.middleware";
import logger from "./utils/logger";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use((req, res, next) => {
    logger.info(`REQUEST ${req.method} ${req.url}`);
    next();
});

app.use(errorMiddleware)

app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
});