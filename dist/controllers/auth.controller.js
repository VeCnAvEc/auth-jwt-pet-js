"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("../services/auth.service"));
const logger_1 = __importDefault(require("../utils/logger"));
class AuthController {
    async register(req, res, next) {
        logger_1.default.info("POST /register called");
        try {
            const { email, password } = req.body;
            const result = await auth_service_1.default.register(email, password);
            logger_1.default.info(`User registered: ${email}`);
            res.status(201).json(result);
        }
        catch (err) {
            logger_1.default.error(`Register error: ${err.message}`);
            next(err);
        }
    }
    async login(req, res, next) {
        logger_1.default.info("POST /login called");
        try {
            const { email, password } = req.body;
            const result = await auth_service_1.default.login(email, password);
            logger_1.default.info("POST /login called");
            res.status(200).json(result);
        }
        catch (err) {
            logger_1.default.error(`Login error: ${err.message}`);
            next(err);
        }
    }
    async refresh(req, res, next) {
        logger_1.default.info("POST /refresh called");
        try {
            const { refreshToken, userId } = req.body;
            const result = await auth_service_1.default.refresh(refreshToken, userId);
            logger_1.default.info(`Token refreshed for user: ${userId}`);
            res.status(200).json(result);
        }
        catch (err) {
            logger_1.default.error(`Refresh error: ${err.message}`);
            next(err);
        }
    }
    async logout(req, res, next) {
        logger_1.default.info("POST /logout called");
        try {
            const tokenId = req.tokenId;
            const data = await auth_service_1.default.logout(tokenId);
            logger_1.default.info(`User logged out, tokenId=${tokenId}`);
            res.status(200).json(data);
        }
        catch (err) {
            logger_1.default.error(`Logout error: ${err.message}`);
            next(err);
        }
    }
    async logoutAll(req, res, next) {
        logger_1.default.info("POST /logoutAll called");
        try {
            const userId = req.userId;
            const data = await auth_service_1.default.logoutAll(userId);
            logger_1.default.info(`User logged out from all sessions userId=${userId}`);
            res.status(200).json(data);
        }
        catch (err) {
            logger_1.default.error(`LogoutAll error: ${err.message}`);
            next(err);
        }
    }
    async me(req, res, next) {
        logger_1.default.info("GET /me called");
        try {
            const userId = req.user.id;
            const data = await auth_service_1.default.getCurrentUser(userId);
            logger_1.default.info(`Fetched current user: ${userId}`);
            return res.status(200).json(data);
        }
        catch (err) {
            logger_1.default.error(`Me endpoint error: ${err.message}`);
            next(err);
        }
    }
}
exports.default = new AuthController();
