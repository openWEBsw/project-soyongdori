import 'dotenv/config';
import bcrypt from 'bcrypt';
import prisma from './src/prisma/client.js';

async function main() {
  // 테스트 회원: 부회장(레벨6) + 일반회원(레벨1) + pending 가짜 회원
  const EMAILS = ['admin-vl@local.test', 'admin-mem@local.test', 'admin-pend@local.test'];
  await prisma.member.deleteMany({ where: { email: { in: EMAILS } } });
  const h = await bcrypt.hash('Test1234!', 10);
  const vl = await prisma.member.create({ data: { email: EMAILS[0], passwordHash: h, name: 'vl', status: 'active', position: 'vice_leader' } });
  const mem = await prisma.member.create({ data: { email: EMAILS[1], passwordHash: h, name: 'm', status: 'active', position: 'member' } });
  // pending 회원 + 신청 생성
  const pend = await prisma.member.create({ data: { email: EMAILS[2], passwordHash: h, name: 'p', status: 'pending' } });
  const app = await prisma.joinApplication.create({
    data: { email: pend.email, name: pend.name, part: 'drum', motivation: '하고싶음', member: { connect: { id: pend.id } } },
  });
  console.log(`vl=${vl.id} mem=${mem.id} pend=${pend.id} app=${app.id}`);
}
main();
