
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, TrendingUp, DollarSign, Target, Plus } from 'lucide-react'

export const dynamic = "force-dynamic"

export default async function KeywordsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  const keywords = await prisma.keyword.findMany({
    take: 20,
    orderBy: {
      searchVolume: 'desc'
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Keyword Research</h1>
          <p className="text-gray-600">Discover high-impact keywords for your content strategy</p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Analyze Keywords (Coming Soon)
        </Button>
      </div>

      {/* Search Form - Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle>Keyword Analysis Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Enter keywords to analyze (e.g., shopify SEO, e-commerce tips)"
                disabled
              />
            </div>
            <Button disabled>
              <Search className="h-4 w-4 mr-2" />
              Analyze
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Keyword analysis powered by DataForSEO API is currently under development.
          </p>
        </CardContent>
      </Card>

      {/* Sample Keywords */}
      {keywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sample Keyword Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {keywords.map((keyword: any) => (
                <div key={keyword.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{keyword.keyword}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-gray-600">
                            {keyword.searchVolume?.toLocaleString() || 'N/A'} searches/month
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4 text-orange-600" />
                          <span className="text-sm text-gray-600">
                            Difficulty: {keyword.difficulty || 'N/A'}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-600">
                            CPC: ${keyword.cpc || '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        keyword.competition === 'low' 
                          ? 'bg-green-100 text-green-800'
                          : keyword.competition === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {keyword.competition || 'Unknown'} competition
                      </span>
                    </div>
                  </div>
                  
                  {keyword.relatedKeywords.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Related Keywords:</p>
                      <div className="flex flex-wrap gap-2">
                        {keyword.relatedKeywords.slice(0, 5).map((related: any, index: number) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                          >
                            {related}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {keywords.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No keyword data available</h3>
            <p className="text-gray-600 mb-4">
              Start by analyzing keywords for your content strategy
            </p>
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Analyze Your First Keywords
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
