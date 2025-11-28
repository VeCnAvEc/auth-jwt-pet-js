"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = generateTokens;
exports.verifyRefreshToken = verifyRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
function generateTokens(user) {
    const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, ACCESS_SECRET, { expiresIn: "15m" });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken };
}
function verifyRefreshToken(refreshToken) {
    return jsonwebtoken_1.default.verify(refreshToken, REFRESH_SECRET);
}
function verifyAccessToken(accessToken) {
    return jsonwebtoken_1.default.verify(accessToken, ACCESS_SECRET);
}
