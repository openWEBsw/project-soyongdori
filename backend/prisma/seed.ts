import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client.js';

const url = new URL(process.env.DATABASE_URL!);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port) || 3306,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ''),
  connectionLimit: 5,
  allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({ adapter });

const YEAR = new Date().getFullYear();

const boards = [
  { type: 'notice' as const, name: '공지 게시판', minReadLevel: 0, minWriteLevel: 2, sortOrder: 0 },
  { type: 'free'   as const, name: '자유 게시판', minReadLevel: 0, minWriteLevel: 1, sortOrder: 1 },
  { type: 'resource' as const, name: '자료 게시판', minReadLevel: 1, minWriteLevel: 1, sortOrder: 2 },
  { type: 'photo'  as const, name: '사진 게시판', minReadLevel: 1, minWriteLevel: 1, sortOrder: 3 },
  { type: 'planning' as const, name: '기획부 게시판', minReadLevel: 3, minWriteLevel: 3, sortOrder: 4 },
  { type: 'budget' as const, name: '동아리비 내역', minReadLevel: 4, minWriteLevel: 4, sortOrder: 5 },
];

async function main() {
  for (const board of boards) {
    await prisma.board.upsert({
      where: { type_year: { type: board.type, year: YEAR } },
      update: {},
      create: { ...board, year: YEAR },
    });
    console.log(`✓ ${board.name} (${YEAR})`);
  }
  console.log('Seed complete.');
}

main().finally(() => prisma.$disconnect());
