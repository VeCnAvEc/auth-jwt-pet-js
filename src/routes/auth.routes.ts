import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import refreshMiddleware, { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/logout", refreshMiddleware, AuthController.logout);
router.post("/logoutAll", refreshMiddleware, AuthController.logoutAll);

router.get("/me", authMiddleware, AuthController.me)

export default router;