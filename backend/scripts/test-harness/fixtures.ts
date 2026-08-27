import { PrismaClient } from '@prisma/client';
import { ScenarioContext } from './types';

const prisma = new PrismaClient();

export async function createFixtures(): Promise<ScenarioContext> {
  const email = `test-chatbot-${Date.now()}@specpart.tn`;
  const orderNumber = `TEST${Date.now()}`;
  
  // 1. Create a test user
  const user = await prisma.user.create({
    data: {
      email,
      name: 'Test Chatbot User',
      role: 'CUSTOMER',
    }
  });

  // 2. Create a test order for that user
  const order = await prisma.order.create({
    data: {
      id: orderNumber, // Custom ID to make it easy to match
      userId: user.id,
      status: 'SHIPPED',
      totalAmount: 125.50,
      shipFullName: 'Test Chatbot User',
      shipPhone: '21655123456',
      shipWilaya: 'Tunis',
      shipCity: 'Tunis',
    }
  });

  return {
    testUserEmail: email,
    testOrderId: order.id,
    testOrderNumber: orderNumber,
  };
}

export async function teardownFixtures(ctx: ScenarioContext): Promise<void> {
  // Delete the user, which should cascade and delete the order due to DB relations
  // If cascading is not setup for order (the schema says it is NOT cascaded for order - wait, user relation: `@relation(fields: [userId], references: [id])` - no cascade on Order. Let's delete order first.)
  try {
    await prisma.order.delete({
      where: { id: ctx.testOrderId }
    });
  } catch (e) {
    console.error('Failed to delete test order', e);
  }

  try {
    await prisma.user.delete({
      where: { email: ctx.testUserEmail }
    });
  } catch (e) {
    console.error('Failed to delete test user', e);
  }

  await prisma.$disconnect();
}
