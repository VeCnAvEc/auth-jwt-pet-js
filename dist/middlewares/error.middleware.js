"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = errorMiddleware;
function errorMiddleware(err, req, res, next) {
    console.error("Error:", err.message);
    return res.status(400).json({
        error: true,
        message: err.message || "Something went wrong"
    });
}
