"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = refreshMiddleware;
exports.authMiddleware = authMiddleware;
const prisma_1 = require("../utils/prisma");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const token_1 = require("../utils/token");
const logger_1 = __importDefault(require("../utils/logger"));
async function refreshMiddleware(req, res, next) {
    const token = req.body.refreshToken || req.cookies.refreshToken;
    if (!token) {
        logger_1.default.warn("refreshMiddleware: No token provided");
        return res.status(401).json({ message: "No token provided" });
    }
    logger_1.default.info("refreshMiddleware: refresh token received");
    const user = (0, token_1.verifyRefreshToken)(token);
    try {
        logger_1.default.info(`refreshMiddleware: Looking for tokens of userId=${user.id}`);
        const tokens = await prisma_1.prisma.token.findMany({
            where: {
                userId: user.id
            }
        });
        let matched = null;
        for (const t of tokens) {
            const isMatch = await bcryptjs_1.default.compare(token, t.token);
            if (isMatch) {
                matched = t;
                logger_1.default.info(`refreshMiddleware: token matched, tokenId=${t.id}`);
                break;
            }
        }
        if (!matched) {
            logger_1.default.warn(`refreshMiddleware: Refresh token mismatch for userId=${user.id}`);
            return res.status(401).json({ message: "Invalid token" });
        }
        req.userId = matched.userId;
        req.tokenId = matched.id;
        logger_1.default.info(`refreshMiddleware: Success for userId=${matched.userId}`);
        next();
    }
    catch (err) {
        logger_1.default.error(`refreshMiddleware: DB or server error: ${err}`);
        return res.status(500).json({ message: "Server error" });
    }
}
async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        logger_1.default.warn("authMiddleware: No authorization header");
        return res.status(401).json({ message: "No authorization header" });
    }
    logger_1.default.info("authMiddleware: Authorization header received");
    const token = authHeader.split(" ")[0]; // Bearer <token>
    if (!token) {
        logger_1.default.warn("authMiddleware: Token missing in header");
        return res.status(401).json({ message: "Token missing" });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.ACCESS_SECRET);
        logger_1.default.info(`authMiddleware: Token verified, userId=${payload.id}`);
        req.user = payload;
        next();
    }
    catch (err) {
        if (err.name === "TokenExpiredError") {
            logger_1.default.warn("authMiddleware: Token expired");
            return res.status(401).json({ message: "Token expired" });
        }
        logger_1.default.warn("authMiddleware: Invalid token");
        return res.status(401).json({ message: "Invalid token" });
    }
}
