"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const app_1 = __importDefault(require("./app"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const logger_1 = __importDefault(require("./utils/logger"));
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
app_1.default.use(express_1.default.json());
app_1.default.use((0, cookie_parser_1.default)());
app_1.default.use("/auth", auth_routes_1.default);
app_1.default.use((req, res, next) => {
    logger_1.default.info(`REQUEST ${req.method} ${req.url}`);
    next();
});
app_1.default.use(error_middleware_1.default);
app_1.default.listen(PORT, () => {
    logger_1.default.info(`Server started on port ${PORT}`);
});
