import 'dotenv/config';
import prisma from './src/prisma/client.js';

const members = await prisma.member.findMany({
  select: { id: true, email: true, name: true, status: true, position: true }
});

for (const m of members) {
  console.log(`email: ${m.email} | name: ${m.name} | status: ${m.status} | position: ${m.position}`);
}

if (members.length === 0) {
  console.log('회원이 없습니다');
}

await prisma.$disconnect();
