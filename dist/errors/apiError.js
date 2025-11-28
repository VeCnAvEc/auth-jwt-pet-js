"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
    static badRequest(msg) {
        return new ApiError(400, msg);
    }
    static unauthorized(msg) {
        return new ApiError(401, msg);
    }
    static forbidden(msg) {
        return new ApiError(403, msg);
    }
    static notFound(msg) {
        return new ApiError(404, msg);
    }
    static internal(msg) {
        return new ApiError(500, msg);
    }
}
exports.ApiError = ApiError;
