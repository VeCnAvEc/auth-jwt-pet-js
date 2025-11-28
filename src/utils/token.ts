import jwt from "jsonwebtoken";
import { User } from "../types/user";
import { Tokens } from "../types/token";

const ACCESS_SECRET = process.env.ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.REFRESH_SECRET as string;

export function generateTokens(user: User): Tokens {
    const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        ACCESS_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { id: user.id },
        REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
}

export function verifyRefreshToken(refreshToken: string): User {
    return jwt.verify(refreshToken, REFRESH_SECRET) as User;
}

export function verifyAccessToken(accessToken: string) {
    return jwt.verify(accessToken, ACCESS_SECRET) as any;
}