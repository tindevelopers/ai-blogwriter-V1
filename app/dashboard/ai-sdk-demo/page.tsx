
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import AISdkDemo from '@/components/llm/ai-sdk-demo'

export default async function AISdkDemoPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI SDK v5 Demo</h1>
          <p className="text-muted-foreground">
            Test the enhanced LLM capabilities with Vercel AI SDK integration
          </p>
        </div>
      </div>

      <AISdkDemo />
    </div>
  )
}
