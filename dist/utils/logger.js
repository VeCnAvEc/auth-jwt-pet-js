"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const logger = winston_1.default.createLogger({
    level: "info",
    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.printf((({ level, message, timestamp }) => {
        return `[${level}] ${timestamp} - ${message}`;
    }))),
    transports: [
        new winston_1.default.transports.Console(),
        // Для файлов можно оставить JSON, это правильно
        new winston_1.default.transports.File({
            filename: "logs/error.log",
            level: "error",
            format: winston_1.default.format.json()
        }),
        new winston_1.default.transports.File({
            filename: "logs/app.log",
            format: winston_1.default.format.json()
        })
    ]
});
exports.default = logger;
