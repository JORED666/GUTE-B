import { Response } from 'express';
import pool from '../db/connection';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getPagos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.nombre || ' ' || c.apellido as cliente_nombre
      FROM pago p
      LEFT JOIN cliente c ON p.fk_cliente = c.id_cliente
      WHERE p.fk_admin = $1
      ORDER BY p.created_at DESC
    `, [req.adminId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pagos', error });
  }
};

export const createPago = async (req: AuthRequest, res: Response): Promise<void> => {
  const { fk_cliente, concepto, detalle, monto } = req.body;

  if (!concepto || !detalle || !monto) {
    res.status(400).json({ message: 'Concepto, detalle y monto son requeridos' });
    return;
  }

  try {
    const result = await pool.query(`
      INSERT INTO pago (fk_cliente, fk_admin, concepto, detalle, monto)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [fk_cliente, req.adminId, concepto, detalle, monto]);

    // Si es venta de producto, descontar stock
    if (concepto === 'Producto') {
      await pool.query(
        'UPDATE producto SET stock = stock - 1 WHERE nombre = $1 AND fk_admin = $2 AND stock > 0',
        [detalle, req.adminId]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar pago', error });
  }
};

export const deletePago = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'DELETE FROM pago WHERE id_pago=$1 AND fk_admin=$2 RETURNING *',
      [req.params.id, req.adminId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Pago no encontrado' });
      return;
    }
    res.json({ message: 'Pago eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar pago', error });
  }
};

export const getResumen = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalClientes = await pool.query(
      'SELECT COUNT(*) FROM cliente WHERE fk_admin = $1',
      [req.adminId]
    );

    const gananciasMes = await pool.query(`
      SELECT COALESCE(SUM(monto), 0) as total
      FROM pago
      WHERE fk_admin = $1
      AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)
    `, [req.adminId]);

    const ventasProductos = await pool.query(`
      SELECT COALESCE(SUM(monto), 0) as total
      FROM pago
      WHERE fk_admin = $1 AND concepto = 'Producto'
      AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)
    `, [req.adminId]);

    res.json({
      totalClientes: parseInt(totalClientes.rows[0].count),
      gananciasMes: parseFloat(gananciasMes.rows[0].total),
      ventasProductos: parseFloat(ventasProductos.rows[0].total)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener resumen', error });
  }
};