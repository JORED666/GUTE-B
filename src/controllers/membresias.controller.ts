import { Response } from 'express';
import pool from '../db/connection';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getMembresias = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM membresia ORDER BY id_membresia');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener membresías', error });
  }
};

export const updateMembresia = async (req: AuthRequest, res: Response): Promise<void> => {
  const { precio, duracion_dias } = req.body;
  try {
    const result = await pool.query(`
      UPDATE membresia
      SET precio = $1, duracion_dias = $2
      WHERE id_membresia = $3
      RETURNING *
    `, [precio, duracion_dias, req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Membresía no encontrada' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar membresía', error });
  }
};