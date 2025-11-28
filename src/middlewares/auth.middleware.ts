import { Request, Response, NextFunction } from "express";
import {prisma} from "../utils/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {verifyRefreshToken} from "../utils/token";
import {RefreshToken} from "../types/token";
import logger from "../utils/logger";

export default async function refreshMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const token = req.body.refreshToken || req.cookies.refreshToken;

    if (!token) {
        logger.warn("refreshMiddleware: No token provided");
        return res.status(401).json({ message: "No token provided" });
    }

    logger.info("refreshMiddleware: refresh token received");

    const user = verifyRefreshToken(token);

    try {
        logger.info(`refreshMiddleware: Looking for tokens of userId=${user.id}`);
        const tokens = await prisma.token.findMany({
            where: {
                userId: user.id
            }
        });

        let matched: RefreshToken | null = null;

        for (const t of tokens) {
            const isMatch = await bcrypt.compare(token, t.token);
            if (isMatch) {
                matched = t;
                logger.info(`refreshMiddleware: token matched, tokenId=${t.id}`);
                break;
            }
        }

        if (!matched) {
            logger.warn(`refreshMiddleware: Refresh token mismatch for userId=${user.id}`);
            return res.status(401).json({message: "Invalid token"});
        }

        (req as any).userId = matched.userId;
        (req as any).tokenId = matched.id;

        logger.info(`refreshMiddleware: Success for userId=${matched.userId}`);
        next();
    } catch (err) {
        logger.error(`refreshMiddleware: DB or server error: ${err}`);
        return res.status(500).json({message: "Server error"});
    }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        logger.warn("authMiddleware: No authorization header");
        return res.status(401).json({ message: "No authorization header" });
    }

    logger.info("authMiddleware: Authorization header received");

    const token = authHeader.split(" ")[0]; // Bearer <token>

    if (!token) {
        logger.warn("authMiddleware: Token missing in header");
        return res.status(401).json({ message: "Token missing" });
    }

    try {
        const payload = jwt.verify(token, process.env.ACCESS_SECRET!);

        logger.info(`authMiddleware: Token verified, userId=${(payload as any).id}`);

        (req as any).user = payload;

        next();
    } catch (err: any) {
        if (err.name === "TokenExpiredError") {
            logger.warn("authMiddleware: Token expired");
            return res.status(401).json({ message: "Token expired" });
        }

        logger.warn("authMiddleware: Invalid token");
        return res.status(401).json({ message: "Invalid token" })
    }
}