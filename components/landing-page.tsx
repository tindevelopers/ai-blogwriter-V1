
"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BookOpen, 
  Zap, 
  Target, 
  TrendingUp, 
  ShoppingBag, 
  Search,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <Link className="flex items-center justify-center" href="/">
          <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">BlogWriter</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="#pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="/auth/signin">
            Sign In
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Create <span className="text-blue-600">SEO-Optimized</span> Blogs for Your Shopify Store
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  AI-powered content creation with advanced keyword research and competitor analysis. 
                  Boost your store's organic traffic and sales.
                </p>
              </div>
              <div className="space-x-4 flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/auth/signup">
                    Start Writing Blogs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Everything You Need for <span className="text-blue-600">Successful</span> Blogging
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform combines AI-powered content creation with professional SEO tools designed specifically for Shopify stores.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <Zap className="h-10 w-10 text-blue-600 mb-2" />
                  <CardTitle>AI-Powered Content</CardTitle>
                  <CardDescription>
                    Generate high-quality, engaging blog posts with our advanced AI that understands your brand and audience.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <Search className="h-10 w-10 text-blue-600 mb-2" />
                  <CardTitle>Keyword Research</CardTitle>
                  <CardDescription>
                    Discover high-impact keywords with search volume, difficulty scores, and competitor analysis using DataForSEO.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <ShoppingBag className="h-10 w-10 text-blue-600 mb-2" />
                  <CardTitle>Shopify Integration</CardTitle>
                  <CardDescription>
                    Seamlessly publish blogs directly to your Shopify store with automatic SEO optimization and formatting.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <Target className="h-10 w-10 text-blue-600 mb-2" />
                  <CardTitle>SEO Optimization</CardTitle>
                  <CardDescription>
                    Built-in SEO analysis with recommendations for meta titles, descriptions, and content optimization.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <TrendingUp className="h-10 w-10 text-blue-600 mb-2" />
                  <CardTitle>Performance Tracking</CardTitle>
                  <CardDescription>
                    Monitor your blog performance with analytics and insights to improve your content strategy.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <BookOpen className="h-10 w-10 text-blue-600 mb-2" />
                  <CardTitle>Content Planning</CardTitle>
                  <CardDescription>
                    Plan and schedule your content calendar with AI-suggested topics and optimal publishing times.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="grid gap-10 sm:px-10 md:gap-16 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Why Choose Our Platform?
                </h3>
                <p className="text-gray-500 md:text-xl">
                  Built specifically for Shopify store owners and agencies who want to scale their content marketing efforts efficiently.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Pay per blog - no monthly commitments</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Professional SEO-optimized content</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Direct Shopify integration</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Advanced keyword research</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Active Users</span>
                      </div>
                      <div className="text-2xl font-bold">2,000+</div>
                      <div className="text-sm text-gray-500">Shopify store owners trust our platform</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Blogs Created</span>
                      </div>
                      <div className="text-2xl font-bold">50,000+</div>
                      <div className="text-sm text-gray-500">SEO-optimized articles published</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-600">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white">
                  Ready to Boost Your Store's Traffic?
                </h2>
                <p className="max-w-[600px] text-blue-100 md:text-xl">
                  Join thousands of Shopify store owners who are growing their organic traffic with our AI-powered blog creation platform.
                </p>
              </div>
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-50">
                <Link href="/auth/signup">
                  Get Started Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2024 BlogWriter. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
