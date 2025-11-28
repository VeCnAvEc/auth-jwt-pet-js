import { Request, Response, NextFunction } from "express";
import AuthService from "../services/auth.service";
import logger from "../utils/logger";

class AuthController {
    public async register(req: Request, res: Response, next: NextFunction) {
        logger.info("POST /register called");
        try {
            const { email, password } = req.body;

            const result = await AuthService.register(email, password);

            logger.info(`User registered: ${email}`);
            res.status(201).json(result);
        } catch(err) {
            logger.error(`Register error: ${(err as Error).message}`);
            next(err);
        }
    }

    public async login(req: Request, res: Response, next: NextFunction) {
        logger.info("POST /login called");
        try {
            const { email, password } = req.body;

            const result = await AuthService.login(email, password);

            logger.info("POST /login called");
            res.status(200).json(result);
        } catch(err) {
            logger.error(`Login error: ${(err as Error).message}`);
            next(err);
        }
    }

    public async refresh(req: Request, res: Response, next: NextFunction) {
        logger.info("POST /refresh called");
        try {
            const { refreshToken, userId } = req.body;

            const result = await AuthService.refresh(refreshToken, userId);

            logger.info(`Token refreshed for user: ${userId}`);
            res.status(200).json(result);
        } catch(err) {
            logger.error(`Refresh error: ${(err as Error).message}`);
            next(err);
        }
    }

    public async logout(req: Request, res: Response, next: NextFunction) {
        logger.info("POST /logout called");
        try {
            const tokenId = (req as any).tokenId;
            const data = await AuthService.logout(tokenId);

            logger.info(`User logged out, tokenId=${tokenId}`);

            res.status(200).json(data);
        } catch(err) {
            logger.error(`Logout error: ${(err as Error).message}`);
            next(err);
        }
    }

    public async logoutAll(req: Request, res: Response, next: NextFunction) {
        logger.info("POST /logoutAll called");
        try {
            const userId = (req as any).userId;
            const data = await AuthService.logoutAll(userId);

            logger.info(`User logged out from all sessions userId=${userId}`);

            res.status(200).json(data);
        } catch (err) {
            logger.error(`LogoutAll error: ${(err as Error).message}`);
            next(err);
        }
    }

    public async me(req: Request, res: Response, next: NextFunction) {
        logger.info("GET /me called");
        try {
            const userId = (req as any).user.id;
            const data = await AuthService.getCurrentUser(userId);

            logger.info(`Fetched current user: ${userId}`);

            return res.status(200).json(data);
        } catch(err) {
            logger.error(`Me endpoint error: ${(err as Error).message}`);
            next(err);
        }
    }
}

export default new AuthController();