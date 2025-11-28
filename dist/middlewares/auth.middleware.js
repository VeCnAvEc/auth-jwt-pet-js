"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authMiddleware;
const token_1 = require("../utils/token");
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log("Request headers:", req.headers);
    if (!authHeader)
        return res.status(401).json({ message: "No token provided" });
    const token = authHeader.split(" ")[1];
    try {
        const payload = (0, token_1.verifyAccessToken)(token);
        req.userId = payload.userId;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}
