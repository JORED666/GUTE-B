import { Router } from 'express';
import { getProductos, createProducto, updateProducto, deleteProducto } from '../controllers/productos.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(verificarToken);

router.get('/', getProductos);
router.post('/', createProducto);
router.put('/:id', updateProducto);
router.delete('/:id', deleteProducto);

export default router;