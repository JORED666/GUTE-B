import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import './db/connection';
import authRoutes from './routes/auth.routes';
import clientesRoutes from './routes/clientes.routes';
import productosRoutes from './routes/productos.routes';
import cajaRoutes from './routes/caja.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'CODICE API funcionando' });
});

app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/caja', cajaRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});