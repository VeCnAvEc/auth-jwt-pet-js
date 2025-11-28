export interface Tokens {
    accessToken: string,
    refreshToken: string
}

export interface RefreshToken {
    id: number,
    token: string,
    userId: number,
    createdAt: Date,
    expiresAt: Date
}
export const RefreshStore: Record<string, string> = {};