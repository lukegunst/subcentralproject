import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import DashboardTabs from "./DashboardTabs"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) redirect("/auth/signin")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    select: { id: true, role: true },
  })

  if (!user) redirect("/auth/signin")

  // 🛒 Customer Dashboard
  if (user.role === "CUSTOMER") {
    const subscriptions = await prisma.userSubscription.findMany({
      where: { userId: user.id },
      include: {
        plan: {
          include: { merchant: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // ✅ FIXED: Include full plan object for customer transactions
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      include: {
        plan: {
          include: { 
            merchant: { select: { id: true, name: true, email: true, businessName: true } } 
          },
        },
        invoice: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
        <DashboardTabs 
          subscriptions={subscriptions} 
          transactions={transactions} 
          userRole="CUSTOMER" 
        />
      </div>
    )
  }

  // 🏪 Merchant Dashboard - Fetch Data
  const plans = await prisma.plan.findMany({
    where: { merchantId: user.id },
    include: {
      subscriptions: {
        include: { user: { select: { id: true, email: true, name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // ✅ FIXED: Include full plan object for merchant transactions
  const transactions = await prisma.transaction.findMany({
    where: { merchantId: user.id },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      plan: {
        include: { 
          merchant: { select: { id: true, name: true, email: true, businessName: true } } 
        },
      },
      invoice: true,
    },
    orderBy: { createdAt: "desc" },
  })

  // Fetch raw payouts
  const payoutsRaw = await prisma.payout.findMany({
    where: { merchantId: user.id },
    orderBy: { scheduledDate: "desc" },
  })

  // Normalize payouts so DashboardTabs receives the expected shape:
  // - status limited to "paid" | "pending" (or fallback to string if needed)
  // - ensure paidAt exists (map paidDate -> paidAt if backend uses that)
  const payouts = payoutsRaw.map((p) => ({
    id: p.id,
    merchantId: p.merchantId,
    amount: p.amount,
    // keep Date objects (server side) — DashboardTabs will call new Date(...) when rendering
    scheduledDate: p.scheduledDate,
    // normalize status to either 'paid' or 'pending' (leave other strings through as fallback)
    status: p.status === "paid" ? "paid" : p.status === "pending" ? "pending" : p.status,
    // normalized paidAt (some rows may use paidAt, others paidDate)
    paidAt: (p as any).paidAt ?? (p as any).paidDate ?? null,
    fee: (p as any).fee ?? undefined,
    netAmount: (p as any).netAmount ?? undefined,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }))

  const totalSubscribers = plans.reduce((acc, p) => acc + p.subscriptions.length, 0)
  const monthlyRevenue = plans.reduce(
    (acc, plan) =>
      acc + (plan.interval === "monthly" ? plan.price * plan.subscriptions.length : 0),
    0
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Merchant Dashboard</h1>

      {/* 📊 Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Plans</h3>
          <p className="text-2xl font-bold text-gray-600">{plans.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Subscribers</h3>
          <p className="text-2xl font-bold text-gray-600">{totalSubscribers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Monthly Revenue</h3>
          <p className="text-2xl font-bold text-green-600">R{monthlyRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* 🗂️ Tabbed Content */}
      <DashboardTabs 
        plans={plans} 
        transactions={transactions} 
        payouts={payouts} 
        userRole="MERCHANT" 
      />
    </div>
  )
}