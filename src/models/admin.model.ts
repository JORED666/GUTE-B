export interface Admin {
  id_admin?: number;
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  telefono?: string;
  foto_url?: string;
  created_at?: Date;
}