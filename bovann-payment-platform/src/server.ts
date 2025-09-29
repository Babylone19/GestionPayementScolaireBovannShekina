import app from './app';
import dotenv from 'dotenv';
import { connectDB } from './utils/db';

dotenv.config();

const PORT = parseInt(process.env.PORT as string, 10) || 3000;


const startServer = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});