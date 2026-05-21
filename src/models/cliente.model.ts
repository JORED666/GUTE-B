export interface Cliente {
  id_cliente?: number;
  nombre: string;
  apellido: string;
  telefono?: string;
  correo?: string;
  status?: 'activo' | 'inactivo' | 'suspendido';
  fk_membresia?: number;
  fk_admin?: number;
  fecha_inicio?: Date;
  fecha_vencimiento?: Date;
  created_at?: Date;
}