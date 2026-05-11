import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function run() {
    console.log('Operators:', await p.operator.count());
    console.log('Providers:', await p.provider.count());
    console.log('Products:', await p.product.count());
}
run().finally(() => p.$disconnect());
