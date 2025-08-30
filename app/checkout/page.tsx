import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import CheckoutForm from "./CheckoutForm"

export default async function CheckoutPage({ 
  searchParams 
}: { 
  searchParams: { planId?: string } 
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "USER") {
    return <div className="p-6">Please log in as a user to subscribe.</div>
  }

  if (!searchParams.planId) {
    return <div className="p-6">No plan selected.</div>
  }

  // Get the plan details
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: searchParams.planId },
    include: { merchant: true },
  })

  if (!plan) {
    return <div className="p-6">Plan not found.</div>
  }

  // Check if already subscribed
  const existingSubscription = await prisma.userSubscription.findFirst({
    where: {
      userId: session.user.id,
      planId: plan.id,
      status: "ACTIVE",
    },
  })

  if (existingSubscription) {
    return (
      <div className="p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <p>You are already subscribed to this plan.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plan Details */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-lg">{plan.title}</h3>
            <p className="text-gray-600 mb-2">{plan.description}</p>
            <p className="text-sm text-gray-500 mb-4">
              By: {plan.merchant.businessName}
            </p>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-2xl font-bold text-green-600">
                {plan.currency} {plan.price}
              </p>
              <p className="text-sm text-gray-600">per {plan.interval}</p>
            </div>
          </CardContent>
        </Card>

        {/* Checkout Form */}
        <Card>
          <CardHeader>
            <CardTitle>Subscribe Now</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckoutForm planId={plan.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}