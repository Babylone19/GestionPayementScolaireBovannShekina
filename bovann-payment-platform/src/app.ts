import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import publicRoutes from './routes/public.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import studentRoutes from './routes/student.routes';
import paymentRoutes from './routes/payment.routes';
import accessCardRoutes from './routes/accessCard.routes';
import cardVerificationRoutes from './routes/cardVerification.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cards', accessCardRoutes);
app.use('/api/cards', cardVerificationRoutes);
app.use('/api/public', publicRoutes); 

app.get('/', (req, res) => {
  res.json({ message: 'Bovann Payment Platform API' });
});

app.use(errorHandler);

export default app;