"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = errorMiddleware;
const apiError_1 = require("../errors/apiError");
const client_1 = require("@prisma/client/runtime/client");
const logger_1 = __importDefault(require("../utils/logger"));
function errorMiddleware(err, req, res, next) {
    logger_1.default.error("🔥 Error:", err);
    if (err instanceof apiError_1.ApiError) {
        return res.status(err.status).json({
            status: "error",
            message: err.message
        });
    }
    if (err instanceof client_1.PrismaClientKnownRequestError) {
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
            });
        }
        // fallback
        return res.status(400).json({
            status: "error",
            message: "Error in the request database"
        });
    }
    return res.status(500).json({
        status: "error",
        message: err.message || "Unknown server error"
    });
}
