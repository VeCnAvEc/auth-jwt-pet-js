import bcrypt from "bcryptjs";
import { generateTokens } from "../utils/token";
import { prisma } from "../utils/prisma";
import {isNullish} from "../utils/check";
import {getOneWeek} from "../utils/time";
import {ApiError} from "../errors/apiError";
import logger from "../utils/logger";

class AuthService {
    public async register(email: string, password: string) {
        logger.info(`[register] Attempt to register user: ${email}`);
        const existing = await prisma.user.findUnique({
            where: { email }
        });

        if (existing) {
            logger.warn(`[register] User already exists: ${email}`);
            throw new ApiError(409, "User already exists");
        }

        logger.debug(`[register] Creating new user in DB: ${email}`);
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { email, password: hashedPassword }
        });

        logger.info(`[register] User created with ID: ${user.id}`);

        const tokens = generateTokens(user);
        const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);

        logger.debug(`[register] Saving refresh token for user ${user.id}`);
        await prisma.token.create({
            data: {
                token: hashedRefreshToken,
                userId: user.id,
                expiresAt: getOneWeek()
            }
        });

        logger.info(`[register] Registration completed for user: ${email}`);
        return {
            user,
            ...tokens
        }
    }

    public async login(email: string, password: string) {
        logger.info(`[login] Attempt login for user: ${email}`);

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            logger.warn(`[login] User not found: ${email}`);
            throw new Error("User not found");
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            logger.warn(`[login] Invalid password for user: ${email}`);
            throw new ApiError(401, "Invalid credentials");
        }

        logger.debug(`[login] Generating tokens for user ${user.id}`);
        const tokens = generateTokens(user);
        const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);

        logger.debug(`[login] Saving refresh token for user ${user.id}`);
        await prisma.token.create({
            data: {
                token: hashedRefreshToken,
                userId: user.id,
                expiresAt: getOneWeek(),
            }
        });

        logger.info(`[login] Login successful for user: ${email}`);

        return {
            user: {
                id: user.id,
                email: user.email
            },
            ...tokens
        };
    }

    public async refresh(clientRefreshToken: string, userId: number) {
        logger.info(`[refresh] Attempting refresh for user ${userId}`);

        const refreshTokensInDb = await prisma.token.findMany({
            where: { userId }
        });

        logger.debug(`[refresh] Found ${refreshTokensInDb.length} tokens in DB`);

        let matchedToken = null;

        for (const record of refreshTokensInDb) {
            const ok = await bcrypt.compare(clientRefreshToken, record.token);
            if (ok) {
                matchedToken = record;
                break;
            }
        }

        if (!matchedToken) {
            logger.warn(`[refresh] Invalid refresh token for user: ${userId}`);
            throw new ApiError(401, "RefreshToken invalid");
        }

        logger.debug(`[refresh] Deleting old token ID: ${matchedToken.id}`);
        await prisma.token.delete({
            where: { id: matchedToken.id }
        });

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (isNullish(user)) {
            logger.error(`[refresh] User not found in DB during refresh: ${userId}`);
            throw new ApiError(404, "Not found user");
        }

        logger.debug(`[refresh] Generating new tokens for user ${user.id}`);
        const tokens = generateTokens({id: user.id, email: user.email, password: user.password});

        const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);

        logger.debug(`[refresh] Saving new refresh token for user ${user.id}`);
        await prisma.token.create({
            data: {
                token: hashedRefreshToken,
                userId: user.id,
                expiresAt: getOneWeek()
            }
        });

        logger.info(`[refresh] Token refresh successful for user ${userId}`);

        return {
            ...tokens
        };
    }

    public async logout(tokenId: number) {
        logger.info(`[logout] Deleting token: ${tokenId}`);

        await prisma.token.delete({
            where: { id: tokenId }
        });

        logger.info(`[logout] Token deleted: ${tokenId}`);

        return {
            message: "Logged out successfully"
        };
    }

    public async logoutAll(userId: number) {
        logger.info(`[logoutAll] Removing all tokens for user: ${userId}`);

        const deletedRefreshTokens = await prisma.token.deleteMany({
            where: {
                userId
            }
        });

        logger.info(`[logoutAll] Deleted ${deletedRefreshTokens.count} tokens for user ${userId}`);

        return {
            message: "Logged out successfully",
            logOutCount: deletedRefreshTokens.count
        }
    }

    public async getCurrentUser(userId: number) {
        logger.info(`[me] Fetching user info: ${userId}`);
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, createdAt: true }
        });

        if (!user) {
            logger.warn(`[me] User not found: ${userId}`);
            throw new ApiError(404, "User not found");
        }

        logger.info(`[me] User data fetched successfully for user ${userId}`);

        return {
            ...user
        };
    }
}

export default new AuthService();