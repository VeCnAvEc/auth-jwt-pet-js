"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const token_1 = require("../utils/token");
const token_2 = require("../types/token");
const prisma_1 = require("../utils/prisma");
// ВРЕМЕННАЯ БАЗА ДАННЫХ в памяти
const users = [];
class AuthService {
    async register(email, password) {
        try {
            const existing = await prisma_1.prisma.user.findUnique({
                where: { email }
            });
            console.log(existing);
        }
        catch (err) {
            console.error("error:", err);
        }
        const exists = users.find(u => u.email === email);
        if (exists) {
            throw new Error("User already exists");
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = {
            id: Date.now().toString(),
            email,
            password: hashedPassword
        };
        users.push(user);
        const tokens = (0, token_1.generateTokens)(user);
        token_2.RefreshStore[user.id] = tokens.refreshToken;
        return {
            user: {
                id: user.id,
                email: user.email
            },
            ...tokens
        };
    }
    async login(email, password) {
        const user = users.find(u => u.email === email);
        if (!user) {
            throw new Error("User not found");
        }
        const isValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isValid) {
            throw new Error("Invalid password");
        }
        const tokens = (0, token_1.generateTokens)(user);
        token_2.RefreshStore[user.id] = tokens.refreshToken;
        return {
            user: {
                id: user.id,
                email: user.email,
            },
            ...tokens
        };
    }
    async refresh(refreshToken) {
        const payload = (0, token_1.verifyRefreshToken)(refreshToken);
        const saved = token_2.RefreshStore[payload.id];
        if (!saved)
            throw new Error("Refresh token revoked");
        if (saved !== refreshToken)
            throw new Error("Wrong refresh token");
        const newTokens = (0, token_1.generateTokens)(payload);
        token_2.RefreshStore[payload.id] = newTokens.refreshToken;
        return newTokens;
    }
    async logout(userId) {
        delete token_2.RefreshStore[userId];
        return { message: "Logged out" };
    }
    async getCurrentUser(userId) {
        const user = users.find(u => u.id === userId);
        if (!user)
            throw new Error("User not found");
        return {
            id: user.id,
            email: user.email
        };
    }
}
exports.default = new AuthService();
