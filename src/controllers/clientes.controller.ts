import { Response } from 'express';
import pool from '../db/connection';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getClientes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT c.*, m.tipo as membresia_tipo, m.precio as membresia_precio
      FROM cliente c
      LEFT JOIN membresia m ON c.fk_membresia = m.id_membresia
      WHERE c.fk_admin = $1
      ORDER BY c.created_at DESC
    `, [req.adminId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener clientes', error });
  }
};

export const getClienteById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT c.*, m.tipo as membresia_tipo
      FROM cliente c
      LEFT JOIN membresia m ON c.fk_membresia = m.id_membresia
      WHERE c.id_cliente = $1 AND c.fk_admin = $2
    `, [req.params.id, req.adminId]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Cliente no encontrado' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener cliente', error });
  }
};

export const createCliente = async (req: AuthRequest, res: Response): Promise<void> => {
  const { nombre, apellido, telefono, correo, fk_membresia } = req.body;

  if (!nombre || !apellido || !fk_membresia) {
    res.status(400).json({ message: 'Nombre, apellido y membresía son requeridos' });
    return;
  }

  try {
    const membresia = await pool.query(
      'SELECT duracion_dias, tipo, precio FROM membresia WHERE id_membresia = $1',
      [fk_membresia]
    );

    const duracion = membresia.rows[0]?.duracion_dias || 30;
    const tipoMembresia = membresia.rows[0]?.tipo;
    const precioMembresia = membresia.rows[0]?.precio;

    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + duracion);

    const result = await pool.query(`
      INSERT INTO cliente (nombre, apellido, telefono, correo, fk_membresia, fk_admin, fecha_vencimiento)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [nombre, apellido, telefono, correo, fk_membresia, req.adminId, fechaVencimiento]);

    const clienteCreado = result.rows[0];

    await pool.query(`
      INSERT INTO pago (fk_cliente, fk_admin, concepto, detalle, monto)
      VALUES ($1, $2, 'Membresía', $3, $4)
    `, [clienteCreado.id_cliente, req.adminId, tipoMembresia, precioMembresia]);

    res.status(201).json(clienteCreado);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear cliente', error });
  }
};

export const updateCliente = async (req: AuthRequest, res: Response): Promise<void> => {
  const { nombre, apellido, telefono, correo, status, fk_membresia } = req.body;

  try {
    // Obtener membresía actual del cliente
    const clienteActual = await pool.query(
      'SELECT fk_membresia FROM cliente WHERE id_cliente = $1',
      [req.params.id]
    );

    let fechaVencimiento = null;
    const membresiaAnterior = clienteActual.rows[0]?.fk_membresia;

    // Solo recalcular si cambió la membresía
    if (fk_membresia && fk_membresia != membresiaAnterior) {
      const membresia = await pool.query(
        'SELECT duracion_dias FROM membresia WHERE id_membresia = $1',
        [fk_membresia]
      );
      const duracion = membresia.rows[0]?.duracion_dias || 30;
      fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() + duracion);
    }

    const result = await pool.query(`
      UPDATE cliente
      SET nombre=$1, apellido=$2, telefono=$3, correo=$4, status=$5, fk_membresia=$6,
          fecha_vencimiento=COALESCE($7, fecha_vencimiento)
      WHERE id_cliente=$8 AND fk_admin=$9
      RETURNING *
    `, [nombre, apellido, telefono, correo, status, fk_membresia, fechaVencimiento, req.params.id, req.adminId]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Cliente no encontrado' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar cliente', error });
  }
};

export const deleteCliente = async (req: AuthRequest, res: Response): Promise<void> => {
  try { 
    await pool.query(
      'DELETE FROM pago WHERE fk_cliente = $1',
      [req.params.id]
    );

    const result = await pool.query(
      'DELETE FROM cliente WHERE id_cliente=$1 AND fk_admin=$2 RETURNING *',
      [req.params.id, req.adminId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Cliente no encontrado' });
      return;
    }
    res.json({ message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar cliente', error });
  }
};