
import { User, ShopifyStore, Blog, Article, Keyword, SeoData } from "@prisma/client"

export interface ExtendedUser extends User {
  shopifyStores?: ShopifyStore[]
  blogs?: Blog[]
  articles?: Article[]
}

export interface BlogWithRelations extends Blog {
  user: User
  store: ShopifyStore
  articles: Article[]
  keywords: Keyword[]
}

export interface ArticleWithRelations extends Article {
  user: User
  store: ShopifyStore
  blog: Blog
  seoData?: SeoData | null
  keywords: Keyword[]
}

export interface ShopifyStoreWithRelations extends ShopifyStore {
  user: User
  blogs: Blog[]
  articles: Article[]
}

export interface SeoDataWithRelations extends SeoData {
  article: Article
  keywords: Keyword[]
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ShopifyApiConfig {
  storeUrl: string
  accessToken: string
}

export interface DataForSeoConfig {
  login: string
  password: string
}

// Form Types
export interface SignUpFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  companyName?: string
}

export interface SignInFormData {
  email: string
  password: string
}

export interface BlogFormData {
  title: string
  description?: string
  storeId: string
}

export interface ArticleFormData {
  title: string
  content: string
  excerpt?: string
  blogId: string
  focusKeyword?: string
  scheduledAt?: Date
}

export interface ShopifyStoreFormData {
  storeName: string
  storeUrl: string
  accessToken: string
}

// Dashboard Types
export interface DashboardStats {
  totalBlogs: number
  totalArticles: number
  publishedArticles: number
  draftArticles: number
  totalStores: number
  monthlyUsage: number
}

// SEO Types
export interface SeoAnalysis {
  score: number
  suggestions: string[]
  keywordDensity: number
  readabilityScore: number
  metaTitle?: string
  metaDescription?: string
}

export interface KeywordData {
  keyword: string
  searchVolume: number
  difficulty: number
  cpc: number
  competition: string
  relatedKeywords: string[]
}
