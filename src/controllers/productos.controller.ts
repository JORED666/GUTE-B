import { Response } from 'express';
import pool from '../db/connection';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getProductos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT * FROM producto WHERE fk_admin = $1 ORDER BY created_at DESC',
      [req.adminId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos', error });
  }
};

export const createProducto = async (req: AuthRequest, res: Response): Promise<void> => {
  const { nombre, categoria, precio, stock } = req.body;

  if (!nombre || !precio) {
    res.status(400).json({ message: 'Nombre y precio son requeridos' });
    return;
  }

  try {
    const result = await pool.query(`
      INSERT INTO producto (nombre, categoria, precio, stock, fk_admin)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [nombre, categoria, precio, stock || 0, req.adminId]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear producto', error });
  }
};

export const updateProducto = async (req: AuthRequest, res: Response): Promise<void> => {
  const { nombre, categoria, precio, stock } = req.body;

  try {
    const result = await pool.query(`
      UPDATE producto
      SET nombre=$1, categoria=$2, precio=$3, stock=$4
      WHERE id_producto=$5 AND fk_admin=$6
      RETURNING *
    `, [nombre, categoria, precio, stock, req.params.id, req.adminId]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar producto', error });
  }
};

export const deleteProducto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'DELETE FROM producto WHERE id_producto=$1 AND fk_admin=$2 RETURNING *',
      [req.params.id, req.adminId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar producto', error });
  }
};