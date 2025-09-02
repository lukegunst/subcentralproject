// app/merchant/[merchantId]/page.tsx
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import dynamic from "next/dynamic"
import { notFound } from "next/navigation"

// SubscribeButton is a client component — load dynamically so SSR doesn't attempt to render it.
const SubscribeButton = dynamic(
  () => import("../../marketplace/SubscribeButton").catch(() => () => null),
  { ssr: false }
)

type Props = {
  params: {
    merchantId: string
  }
}

export default async function MerchantPage({ params }: Props) {
  const merchantId = params.merchantId

  // Fetch merchant
  const merchant = await prisma.user.findUnique({
    where: { id: merchantId },
    select: {
      id: true,
      name: true,
      businessName: true,
      email: true,
      createdAt: true,
      // add any other fields you want available
    },
  })

  if (!merchant) return notFound()

  // Fetch plans for this merchant
  const plans = await prisma.plan.findMany({
    where: { merchantId: merchant.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-xl font-semibold text-gray-600">
            {merchant.businessName?.[0] ?? merchant.name?.[0] ?? "M"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {merchant.businessName || merchant.name}
            </h1>
            <p className="text-sm text-gray-500">{merchant.email}</p>
            <p className="text-sm text-gray-400 mt-1">
              Joined {new Date(merchant.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Plans by {merchant.businessName || merchant.name}</h2>

        {plans.length === 0 ? (
          <p className="text-gray-600">This merchant has not created any plans yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className="border rounded-lg p-4 bg-white shadow-sm">
                {plan.imageUrl && (
                  <img
                    src={plan.imageUrl}
                    alt={`${plan.name} image`}
                    className="w-full h-40 object-cover rounded-md mb-3"
                  />
                )}

                <h3 className="text-lg font-medium">{plan.name}</h3>
                {plan.description && (
                  <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                )}

                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-base font-bold">
                      ${plan.price}/{plan.interval}
                    </p>
                  </div>

                  {/* SubscribeButton is client-side; loaded dynamically */}
                  <div>
                    {/* If SubscribeButton fails to load, this will render nothing */}
                    <SubscribeButton planId={plan.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-8">
        <Link href="/marketplace" className="text-sm text-blue-600 hover:underline">
          ← Back to marketplace
        </Link>
      </div>
    </div>
  )
}