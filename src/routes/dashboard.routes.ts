import { Router } from 'express';
import { getDashboard } from '../controllers/dashboard.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(verificarToken);
router.get('/', getDashboard);

export default router;