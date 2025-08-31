import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ProfileForm from "./ProfileForm"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) redirect("/auth/signin")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      address: true,
      businessName: true,
      description: true,
      profileImage: true,
      role: true,
    },
  })

  if (!user) redirect("/auth/signin")

  // Only merchants can access profile editing for now
  if (user.role !== "MERCHANT") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-600 mt-2">Update your merchant profile information</p>
        </div>

        <ProfileForm user={user} />
      </div>
    </div>
  )
}