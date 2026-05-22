import {  Router } from 'express';
import { getPagos, createPago, deletePago, getResumen} from '../controllers/caja.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getPagos);
router.get('/resumen', getResumen);
router.post('/', createPago);
router.delete('/:id', deletePago);

export default router;
