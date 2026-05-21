import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './db/connection';

import authRoutes from './routes/auth.routes';
import clientesRoutes from './routes/clientes.routes';
import productosRoutes from './routes/productos.routes';
import cajaRoutes from './routes/caja.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/caja', cajaRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'CODICE API funcionando' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});