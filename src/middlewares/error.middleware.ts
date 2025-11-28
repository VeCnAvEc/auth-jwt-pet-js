import { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/apiError";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import logger from "../utils/logger";

export default function errorMiddleware(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {

    logger.error("🔥 Error:", err);

    if (err instanceof ApiError) {
        return res.status(err.status).json({
            status: "error",
            message: err.message
        });
    }

    if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            // unique constraint
            const field = err.meta?.target;
            return res.status(400).json({
                status: "error",
                message: `An entry with this ${field} already exists`
            });
        }

        // Not found records
        if (err.code === "P2025") {
            return res.status(404).json({
                status: "error",
                message: "The record was not found"
            })
        }

        // fallback
        return res.status(400).json({
            status: "error",
            message: "Error in the request database"
        })
    }

    return res.status(500).json({
        status: "error",
        message: err.message || "Unknown server error"
    })
}