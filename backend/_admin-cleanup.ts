import 'dotenv/config';
import prisma from './src/prisma/client.js';
async function main() {
  const EMAILS = ['admin-vl@local.test', 'admin-mem@local.test', 'admin-pend@local.test'];
  const ms = await prisma.member.findMany({ where: { email: { in: EMAILS } }, select: { id: true, applicationId: true } });
  const memIds = ms.map(m => m.id);
  const appIds = ms.map(m => m.applicationId).filter((x): x is bigint => !!x);
  await prisma.member.updateMany({ where: { id: { in: memIds } }, data: { applicationId: null } });
  if (appIds.length) await prisma.joinApplication.deleteMany({ where: { id: { in: appIds } } });
  const r = await prisma.member.deleteMany({ where: { email: { in: EMAILS } } });
  console.log(`member ${r.count}, app ${appIds.length} 삭제`);
}
main();
