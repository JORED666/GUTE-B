import { Router } from 'express';
import { getMembresias, updateMembresia } from '../controllers/membresias.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(verificarToken);
router.get('/', getMembresias);
router.put('/:id', updateMembresia);

export default router;
