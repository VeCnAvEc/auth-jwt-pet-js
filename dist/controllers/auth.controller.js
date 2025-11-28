"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("../services/auth.service"));
class AuthController {
    async register(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await auth_service_1.default.register(email, password);
            res.status(201).json(result);
        }
        catch (err) {
            next(err);
        }
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await auth_service_1.default.login(email, password);
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    }
    async refresh(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await auth_service_1.default.login(email, password);
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    }
    async logout(req, res, next) {
        try {
            const userId = req.userId;
            const data = await auth_service_1.default.logout(userId);
            return res.json(data);
        }
        catch (err) {
            next(err);
        }
    }
    async me(req, res, next) {
        try {
            const userId = req.userId;
            const data = await auth_service_1.default.getCurrentUser(userId);
            return res.json(data);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.default = new AuthController();
