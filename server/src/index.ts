import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import proposalRoutes from './routes/proposal.routes';
import milestoneRoutes from './routes/milestone.routes';
import reviewRoutes from './routes/review.routes';
import activityRoutes from './routes/activity.routes';
import userRoutes from './routes/user.routes';

dotenv.config();

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({ success: true, message: 'GovGrant API is running 🚀' });
});

// TODO: routes will be added here
app.use('/api/auth', authRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api', milestoneRoutes);
app.use('/api', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activity', activityRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});