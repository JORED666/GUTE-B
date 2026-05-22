import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/connection';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    res.status(400).json({ message: 'Correo y contraseña son requeridos' });
    return;
  }

  try {
    const result = await pool.query(
      'SELECT * FROM administrador WHERE correo = $1',
      [correo]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ message: 'Credenciales incorrectas' });
      return;
    }

    const admin = result.rows[0];
    const passwordValida = await bcrypt.compare(password, admin.password);

    if (!passwordValida) {
      res.status(401).json({ message: 'Credenciales incorrectas' });
      return;
    }

    const token = jwt.sign(
      { id_admin: admin.id_admin },
      process.env.JWT_SECRET as string,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      admin: {
        id_admin: admin.id_admin,
        nombre: admin.nombre,
        apellido: admin.apellido,
        correo: admin.correo,
        foto_url: admin.foto_url
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id_admin, nombre, apellido, correo, telefono, foto_url FROM administrador WHERE id_admin = $1',
      [req.adminId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};