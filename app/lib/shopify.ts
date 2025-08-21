
import { ShopifyApiConfig } from './types'

export class ShopifyClient {
  private storeUrl: string
  private accessToken: string

  constructor(config: ShopifyApiConfig) {
    this.storeUrl = config.storeUrl.replace(/https?:\/\//, '').replace(/\/$/, '')
    this.accessToken = config.accessToken
  }

  private get baseUrl() {
    return `https://${this.storeUrl}/admin/api/2023-10`
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': this.accessToken,
    }
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Shopify API Error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    return data
  }

  // Blog operations
  async getBlogs() {
    return this.request('/blogs.json')
  }

  async getBlog(blogId: string) {
    return this.request(`/blogs/${blogId}.json`)
  }

  async createBlog(blogData: {
    title: string
    handle?: string
    commentable?: string
    feedburner?: string
    feedburner_location?: string
  }) {
    return this.request('/blogs.json', {
      method: 'POST',
      body: JSON.stringify({ blog: blogData }),
    })
  }

  async updateBlog(blogId: string, blogData: any) {
    return this.request(`/blogs/${blogId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ blog: blogData }),
    })
  }

  async deleteBlog(blogId: string) {
    return this.request(`/blogs/${blogId}.json`, {
      method: 'DELETE',
    })
  }

  // Article operations
  async getArticles(blogId: string, params?: {
    limit?: number
    page?: number
    since_id?: string
    created_at_min?: string
    created_at_max?: string
    updated_at_min?: string
    updated_at_max?: string
    published_at_min?: string
    published_at_max?: string
    published_status?: 'published' | 'unpublished' | 'any'
    handle?: string
    tag?: string
    author?: string
    fields?: string
  }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }
    
    const queryString = queryParams.toString()
    const endpoint = `/blogs/${blogId}/articles.json${queryString ? `?${queryString}` : ''}`
    
    return this.request(endpoint)
  }

  async getArticle(blogId: string, articleId: string) {
    return this.request(`/blogs/${blogId}/articles/${articleId}.json`)
  }

  async createArticle(blogId: string, articleData: {
    title: string
    body_html: string
    excerpt?: string
    handle?: string
    published?: boolean
    published_at?: string
    author?: string
    tags?: string
    summary?: string
    meta_title?: string
    meta_description?: string
  }) {
    return this.request(`/blogs/${blogId}/articles.json`, {
      method: 'POST',
      body: JSON.stringify({ article: articleData }),
    })
  }

  async updateArticle(blogId: string, articleId: string, articleData: any) {
    return this.request(`/blogs/${blogId}/articles/${articleId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ article: articleData }),
    })
  }

  async deleteArticle(blogId: string, articleId: string) {
    return this.request(`/blogs/${blogId}/articles/${articleId}.json`, {
      method: 'DELETE',
    })
  }

  // Store information
  async getShop() {
    return this.request('/shop.json')
  }

  // Test connection
  async testConnection() {
    try {
      const shop = await this.getShop()
      return { success: true, shop: shop.shop }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export const createShopifyClient = (config: ShopifyApiConfig) => {
  return new ShopifyClient(config)
}
