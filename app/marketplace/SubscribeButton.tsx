'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function SubscribeButton({ planId }: { planId: string }) {
  const router = useRouter()

  const handleSubscribe = () => {
    router.push(`/checkout?planId=${planId}`)
  }

  return (
    <Button onClick={handleSubscribe}>
      Subscribe
    </Button>
  )
}