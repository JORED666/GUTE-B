import { Response } from 'express';
import pool from '../db/connection';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const ultimosClientes = await pool.query(`
      SELECT c.*, m.tipo as membresia_tipo
      FROM cliente c
      LEFT JOIN membresia m ON c.fk_membresia = m.id_membresia
      WHERE c.fk_admin = $1
      ORDER BY c.created_at DESC
      LIMIT 5
    `, [req.adminId]);

    const ultimosProductos = await pool.query(`
      SELECT p.*, c.nombre || ' ' || c.apellido as cliente_nombre
      FROM pago p
      LEFT JOIN cliente c ON p.fk_cliente = c.id_cliente
      WHERE p.fk_admin = $1 AND p.concepto = 'Producto'
      ORDER BY p.created_at DESC
      LIMIT 5
    `, [req.adminId]);

    const ingresosPorMes = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', fecha), 'Mon') as mes,
        COALESCE(SUM(monto), 0) as total
      FROM pago
      WHERE fk_admin = $1
      AND fecha >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', fecha)
      ORDER BY DATE_TRUNC('month', fecha)
    `, [req.adminId]);

    const distribucionMembresias = await pool.query(`
      SELECT m.tipo, COUNT(*) as total
      FROM cliente c
      JOIN membresia m ON c.fk_membresia = m.id_membresia
      WHERE c.fk_admin = $1
      GROUP BY m.tipo
    `, [req.adminId]);

    res.json({
      totalClientes: parseInt(totalClientes.rows[0].count),
      gananciasMes: parseFloat(gananciasMes.rows[0].total),
      ventasProductos: parseFloat(ventasProductos.rows[0].total),
      ultimosClientes: ultimosClientes.rows,
      ultimosProductos: ultimosProductos.rows,
      ingresosPorMes: ingresosPorMes.rows,
      distribucionMembresias: distribucionMembresias.rows
    });

  } catch (error) {
    res.status(500).json({ message: 'Error al obtener dashboard', error });
  }
};