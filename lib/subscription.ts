import { auth } from '@clerk/nextjs';
import prismadb from '@/lib/prismadb';

/* The line is defining a constant variable named `DAY_IN_MS` and
assigning it a value of 86,400,000. This value represents the number of milliseconds in a day. */
const DAY_IN_MS = 86_400_000;

export const checkSubscription = async () => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

 /* The code is using the `prismadb` library to query the `userSubscription` table in the database. It
 is finding a unique record that matches the `userId` provided. The `select` parameter specifies the
 fields to include in the result, which are `stripeCurrentPeriodEnd`, `stripeCustomerId`,
 `stripePriceId`, and `stripeSubscriptionId`. The result is stored in the `userSubscription`
 variable. */
  const userSubscription = await prismadb.userSubscription.findUnique({
    where: {
      userId: userId,
    },
    select: {
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
      stripeSubscriptionId: true,
    },
  });

  if (!userSubscription) {
    return false;
  }

  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS >
      Date.now();

  return !!isValid;
};
