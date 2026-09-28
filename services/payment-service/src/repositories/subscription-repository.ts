import { Prisma, PrismaClient, SubscriptionStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const subscriptionRepository = {
  listActivePlans: () => prisma.subscriptionPlan.findMany({ where: { active: true, interval: { in: ['MONTHLY', 'YEARLY'] } }, orderBy: { amount: 'asc' } }),
  findPlan: (id: string) => prisma.subscriptionPlan.findFirst({ where: { id, active: true } }),
  findCurrentByUser: (userId: string) => prisma.subscription.findFirst({ where: { userId, status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE, SubscriptionStatus.INCOMPLETE] } }, include: { plan: true }, orderBy: { createdAt: 'desc' } }),
  findLatestCustomerByUser: (userId: string) => prisma.subscription.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' }, select: { stripeCustomerId: true } }),
  findByStripeId: (stripeSubscriptionId: string) => prisma.subscription.findUnique({ where: { stripeSubscriptionId }, include: { plan: true } }),
  create: (data: Prisma.SubscriptionCreateInput) => prisma.subscription.create({ data, include: { plan: true } }),
  updateByStripeId: (stripeSubscriptionId: string, data: Prisma.SubscriptionUpdateInput) => prisma.subscription.update({ where: { stripeSubscriptionId }, data, include: { plan: true } }),
  createEventIfNew: async (data: Prisma.SubscriptionEventCreateInput) => {
    try { return { created: true, event: await prisma.subscriptionEvent.create({ data }) }; }
    catch (error) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return { created: false, event: null }; throw error; }
  },
};

export { prisma };
