import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import boardRouter from './routes/board.js';
import authRouter from './routes/auth.js';
import applicationRouter from './routes/application.js';
import calendarRouter from './routes/calendar.js'
import adminRouter from './routes/admin.js';
import cookieParser from 'cookie-parser';
import memberRouter from './routes/member.js';
import receiptAnalyzeRouter from './routes/receiptAnalyzer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3000;

app.set('json replacer', (_key: string, value: unknown) =>
  typeof value === 'bigint' ? value.toString() : value
);

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(cookieParser());
app.use(express.json());
// 업로드 파일은 브라우저에서 실행되지 않게함
app.use('/uploads', express.static(path.join(__dirname, '../../uploads'), {
  setHeaders: (res) => {
    res.setHeader('Content-Disposition', 'attachment');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  },
}));

// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.path}`);
//   next();
// });

// 정적 파일 서빙
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath, {
  maxAge: 0,
  setHeaders: (res, filePath) => {
    if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// api 라우팅
app.use('/api/auth', authRouter);
app.use('/api/boards', boardRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/members', memberRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/admin', adminRouter);
app.use('/api/receipt', receiptAnalyzeRouter);

// SPA fallback
app.get('*path', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(publicPath, 'index.html'), (err) => {
    if (err) {
      if (req.path === '/') {
        res.json({ message: 'server running but frontend build error' });
      } else {
        next();
      }
    }
  });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message || '서버 오류' } });
});

app.listen(port, () => {
  console.log(`server started on port ${port}`);
});