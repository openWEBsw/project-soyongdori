import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import boardRouter from './routes/board.js';
import authRouter from './routes/auth.js';
import applicationRouter from './routes/application.js';
import cookieParser from 'cookie-parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3000;

app.set('json replacer', (_key: string, value: unknown) =>
  typeof value === 'bigint' ? value.toString() : value
);

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'server running' });
});

app.use('/api/auth', authRouter);
app.use('/api/boards', boardRouter);
app.use('/api/applications', applicationRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message || '서버 오류' } });
});

app.listen(port, () => {
  console.log(`server started on port ${port}`);
});