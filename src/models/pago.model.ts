export interface Pago {
  id_pago?: number;
  fk_cliente?: number;
  fk_admin?: number;
  concepto: 'Membresía' | 'Producto';
  detalle: string;
  monto: number;
  fecha?: Date;
  created_at?: Date;
}