import { Router } from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import { getClientes, getClienteById, createCliente, updateCliente, deleteCliente, getClientesPorVencer } from '../controllers/clientes.controller';

const router = Router();

router.use(verificarToken);

router.get('/', getClientes);
router.get('/:id', getClienteById);
router.post('/', createCliente);
router.put('/:id', updateCliente);
router.delete('/:id', deleteCliente);
router.get('/por-vencer', getClientesPorVencer);

export default router;