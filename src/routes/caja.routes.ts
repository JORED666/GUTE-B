import { Router } from 'express';
import { getPagos, createPago, deletePago, getResumen } from '../controllers/caja.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getPagos);
router.get('/resumen', getResumen);
router.post('/', createPago);
router.delete('/:id', deletePago);

export default router;
