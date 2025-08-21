
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create test users
  const hashedPassword = await bcrypt.hash('johndoe123', 12)

  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      companyName: 'Test Company',
      password: hashedPassword,
    },
  })

  console.log('Created test user:', testUser.email)

  // Create subscription for test user
  await prisma.subscription.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      plan: 'pro',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      blogCredits: 50,
      usedCredits: 5
    }
  })

  // Create sample Shopify store
  const sampleStore = await prisma.shopifyStore.upsert({
    where: { 
      userId_storeUrl: {
        userId: testUser.id,
        storeUrl: 'test-store.myshopify.com'
      }
    },
    update: {},
    create: {
      userId: testUser.id,
      storeName: 'Test Store',
      storeUrl: 'test-store.myshopify.com',
      accessToken: 'sample-token',
      isActive: true
    }
  })

  // Create sample blog
  const sampleBlog = await prisma.blog.upsert({
    where: {
      id: 'sample-blog-id-' + testUser.id
    },
    update: {},
    create: {
      id: 'sample-blog-id-' + testUser.id,
      userId: testUser.id,
      storeId: sampleStore.id,
      title: 'Sample Blog',
      description: 'A sample blog for testing purposes',
      status: 'active'
    }
  })

  // Create sample article
  await prisma.article.upsert({
    where: {
      id: 'sample-article-id-' + testUser.id
    },
    update: {},
    create: {
      id: 'sample-article-id-' + testUser.id,
      userId: testUser.id,
      storeId: sampleStore.id,
      blogId: sampleBlog.id,
      title: 'Getting Started with E-commerce SEO',
      content: `
        <h2>Introduction to E-commerce SEO</h2>
        <p>Search Engine Optimization (SEO) is crucial for the success of any e-commerce business. In this comprehensive guide, we'll explore the fundamentals of e-commerce SEO and how to implement effective strategies for your Shopify store.</p>
        
        <h2>Why E-commerce SEO Matters</h2>
        <p>With millions of online stores competing for customers' attention, having a strong SEO strategy can make the difference between success and failure. Here are key reasons why SEO is essential:</p>
        <ul>
          <li>Increased organic traffic and visibility</li>
          <li>Better user experience and site navigation</li>
          <li>Higher conversion rates and sales</li>
          <li>Long-term sustainable growth</li>
        </ul>

        <h2>Key SEO Strategies for E-commerce</h2>
        <p>Implementing the right SEO strategies can significantly improve your store's performance:</p>
        
        <h3>1. Keyword Research</h3>
        <p>Start by identifying relevant keywords that your target customers are searching for. Focus on:</p>
        <ul>
          <li>Product-specific keywords</li>
          <li>Long-tail keywords with buying intent</li>
          <li>Local SEO keywords if applicable</li>
        </ul>

        <h3>2. On-Page Optimization</h3>
        <p>Optimize your product pages and content with:</p>
        <ul>
          <li>Compelling title tags and meta descriptions</li>
          <li>High-quality product descriptions</li>
          <li>Optimized images with alt text</li>
          <li>Clean URL structure</li>
        </ul>

        <h2>Conclusion</h2>
        <p>E-commerce SEO is an ongoing process that requires consistent effort and optimization. By following these strategies and staying updated with the latest SEO trends, you can improve your store's visibility and drive more organic traffic.</p>
      `,
      excerpt: 'Learn the fundamentals of e-commerce SEO and discover proven strategies to boost your Shopify store\'s organic traffic and sales.',
      slug: 'getting-started-ecommerce-seo',
      status: 'published',
      publishedAt: new Date()
    }
  })

  // Create sample keywords
  const keywords = [
    {
      keyword: 'e-commerce SEO',
      searchVolume: 8900,
      difficulty: 65,
      cpc: 3.45,
      competition: 'medium',
      relatedKeywords: ['shopify SEO', 'online store optimization', 'ecommerce marketing']
    },
    {
      keyword: 'shopify SEO tips',
      searchVolume: 2400,
      difficulty: 45,
      cpc: 2.10,
      competition: 'low',
      relatedKeywords: ['shopify optimization', 'SEO for online stores', 'shopify marketing']
    },
    {
      keyword: 'online store marketing',
      searchVolume: 5600,
      difficulty: 55,
      cpc: 4.20,
      competition: 'medium',
      relatedKeywords: ['ecommerce marketing', 'digital marketing', 'online advertising']
    }
  ]

  for (const keywordData of keywords) {
    await prisma.keyword.upsert({
      where: { keyword: keywordData.keyword },
      update: keywordData,
      create: keywordData
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
