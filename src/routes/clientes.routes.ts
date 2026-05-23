import { Router } from 'express';
import { getClientes, getClienteById, createCliente, updateCliente, deleteCliente } from '../controllers/clientes.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(verificarToken);

router.get('/', getClientes);
router.get('/:id', getClienteById);
router.post('/', createCliente);
router.put('/:id', updateCliente);
router.delete('/:id', deleteCliente);

export default router;