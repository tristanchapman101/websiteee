import { Suspense } from "react"
import Dashboard from "@/components/dashboard"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Suspense
        fallback={
          <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        }
      >
        <Dashboard />
      </Suspense>
    </main>
  )
}

