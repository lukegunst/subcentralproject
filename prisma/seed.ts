import { prisma } from "../lib/prisma"

async function main() {
  await prisma.payout.create({
    data: {
      merchantId: "MERCHANT_USER_ID_HERE",
      transactionId:transaction.Id,
      amount: 500,
      fee: 25,
      netAmount: 475,
      status: "scheduled",
      scheduledDate: new Date("2025-09-05"),
    },
  })
}

main()
  .then(() => console.log("Payouts seeded"))
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })