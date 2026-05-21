export interface Producto {
  id_producto?: number;
  nombre: string;
  categoria?: string;
  precio: number;
  stock?: number;
  fk_admin?: number;
  created_at?: Date;
}