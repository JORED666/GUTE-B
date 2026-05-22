import { Router } from 'express';
import { login, getMe } from '../controllers/auth.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

router.post("/login", login);
router.get("/me", verificarToken, getMe);

export default router;