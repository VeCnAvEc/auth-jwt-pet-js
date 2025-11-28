import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf((({level, message, timestamp}) => {
            return `[${level}] ${timestamp} - ${message}`;
        }))
    ),
    transports: [
        new winston.transports.Console(),

        // Для файлов можно оставить JSON, это правильно
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
            format: winston.format.json()
        }),

        new winston.transports.File({
            filename: "logs/app.log",
            format: winston.format.json()
        })
    ]
});

export default logger;