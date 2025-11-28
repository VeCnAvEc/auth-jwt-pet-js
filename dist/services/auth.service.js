"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const token_1 = require("../utils/token");
const prisma_1 = require("../utils/prisma");
const check_1 = require("../utils/check");
const time_1 = require("../utils/time");
const apiError_1 = require("../errors/apiError");
const logger_1 = __importDefault(require("../utils/logger"));
class AuthService {
    async register(email, password) {
        logger_1.default.info(`[register] Attempt to register user: ${email}`);
        const existing = await prisma_1.prisma.user.findUnique({
            where: { email }
        });
        if (existing) {
            logger_1.default.warn(`[register] User already exists: ${email}`);
            throw new apiError_1.ApiError(409, "User already exists");
        }
        logger_1.default.debug(`[register] Creating new user in DB: ${email}`);
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.prisma.user.create({
            data: { email, password: hashedPassword }
        });
        logger_1.default.info(`[register] User created with ID: ${user.id}`);
        const tokens = (0, token_1.generateTokens)(user);
        const hashedRefreshToken = await bcryptjs_1.default.hash(tokens.refreshToken, 10);
        logger_1.default.debug(`[register] Saving refresh token for user ${user.id}`);
        await prisma_1.prisma.token.create({
            data: {
                token: hashedRefreshToken,
                userId: user.id,
                expiresAt: (0, time_1.getOneWeek)()
            }
        });
        logger_1.default.info(`[register] Registration completed for user: ${email}`);
        return {
            user,
            ...tokens
        };
    }
    async login(email, password) {
        logger_1.default.info(`[login] Attempt login for user: ${email}`);
        const user = await prisma_1.prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            logger_1.default.warn(`[login] User not found: ${email}`);
            throw new Error("User not found");
        }
        const isValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isValid) {
            logger_1.default.warn(`[login] Invalid password for user: ${email}`);
            throw new apiError_1.ApiError(401, "Invalid credentials");
        }
        logger_1.default.debug(`[login] Generating tokens for user ${user.id}`);
        const tokens = (0, token_1.generateTokens)(user);
        const hashedRefreshToken = await bcryptjs_1.default.hash(tokens.refreshToken, 10);
        logger_1.default.debug(`[login] Saving refresh token for user ${user.id}`);
        await prisma_1.prisma.token.create({
            data: {
                token: hashedRefreshToken,
                userId: user.id,
                expiresAt: (0, time_1.getOneWeek)(),
            }
        });
        logger_1.default.info(`[login] Login successful for user: ${email}`);
        return {
            user: {
                id: user.id,
                email: user.email
            },
            ...tokens
        };
    }
    async refresh(clientRefreshToken, userId) {
        logger_1.default.info(`[refresh] Attempting refresh for user ${userId}`);
        const refreshTokensInDb = await prisma_1.prisma.token.findMany({
            where: { userId }
        });
        logger_1.default.debug(`[refresh] Found ${refreshTokensInDb.length} tokens in DB`);
        let matchedToken = null;
        for (const record of refreshTokensInDb) {
            const ok = await bcryptjs_1.default.compare(clientRefreshToken, record.token);
            if (ok) {
                matchedToken = record;
                break;
            }
        }
        if (!matchedToken) {
            logger_1.default.warn(`[refresh] Invalid refresh token for user: ${userId}`);
            throw new apiError_1.ApiError(401, "RefreshToken invalid");
        }
        logger_1.default.debug(`[refresh] Deleting old token ID: ${matchedToken.id}`);
        await prisma_1.prisma.token.delete({
            where: { id: matchedToken.id }
        });
        const user = await prisma_1.prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        if ((0, check_1.isNullish)(user)) {
            logger_1.default.error(`[refresh] User not found in DB during refresh: ${userId}`);
            throw new apiError_1.ApiError(404, "Not found user");
        }
        logger_1.default.debug(`[refresh] Generating new tokens for user ${user.id}`);
        const tokens = (0, token_1.generateTokens)({ id: user.id, email: user.email, password: user.password });
        const hashedRefreshToken = await bcryptjs_1.default.hash(tokens.refreshToken, 10);
        logger_1.default.debug(`[refresh] Saving new refresh token for user ${user.id}`);
        await prisma_1.prisma.token.create({
            data: {
                token: hashedRefreshToken,
                userId: user.id,
                expiresAt: (0, time_1.getOneWeek)()
            }
        });
        logger_1.default.info(`[refresh] Token refresh successful for user ${userId}`);
        return {
            ...tokens
        };
    }
    async logout(tokenId) {
        logger_1.default.info(`[logout] Deleting token: ${tokenId}`);
        await prisma_1.prisma.token.delete({
            where: { id: tokenId }
        });
        logger_1.default.info(`[logout] Token deleted: ${tokenId}`);
        return {
            message: "Logged out successfully"
        };
    }
    async logoutAll(userId) {
        logger_1.default.info(`[logoutAll] Removing all tokens for user: ${userId}`);
        const deletedRefreshTokens = await prisma_1.prisma.token.deleteMany({
            where: {
                userId
            }
        });
        logger_1.default.info(`[logoutAll] Deleted ${deletedRefreshTokens.count} tokens for user ${userId}`);
        return {
            message: "Logged out successfully",
            logOutCount: deletedRefreshTokens.count
        };
    }
    async getCurrentUser(userId) {
        logger_1.default.info(`[me] Fetching user info: ${userId}`);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, createdAt: true }
        });
        if (!user) {
            logger_1.default.warn(`[me] User not found: ${userId}`);
            throw new apiError_1.ApiError(404, "User not found");
        }
        logger_1.default.info(`[me] User data fetched successfully for user ${userId}`);
        return {
            ...user
        };
    }
}
exports.default = new AuthService();
