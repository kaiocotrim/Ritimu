import { Link2 } from "lucide-react"
import Image from "next/image"

import type { SummaryProvider } from "@/lib/activity-summary"

export function SummaryProviderIcon({ provider, size = 16 }: { provider: SummaryProvider; size?: number }) {
  return provider === "other"
    ? <Link2 width={size} height={size} className="pointer-events-none shrink-0" aria-hidden="true" />
    : <Image src={`/icons/${provider}.svg`} alt="" width={size} height={size} className="pointer-events-none shrink-0" />
}
