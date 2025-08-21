
import { DataForSeoConfig, KeywordData } from './types'

export class DataForSeoClient {
  private login: string
  private password: string
  private baseUrl = 'https://api.dataforseo.com/v3'

  constructor(config: DataForSeoConfig) {
    this.login = config.login
    this.password = config.password
  }

  private get authHeader() {
    return 'Basic ' + Buffer.from(`${this.login}:${this.password}`).toString('base64')
  }

  private async request(endpoint: string, data: any[] = []) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`DataForSEO API Error (${response.status}): ${errorText}`)
    }

    const result = await response.json()
    return result
  }

  // Keyword research
  async getKeywordData(keywords: string[], locationName: string = 'United States') {
    const tasks = keywords.map((keyword, index) => ({
      keyword,
      location_name: locationName,
      language_name: 'English',
      tag: `keyword_${index}`,
    }))

    return this.request('/keywords_data/google/search_volume/task_post', tasks)
  }

  async getKeywordSuggestions(keyword: string, locationName: string = 'United States') {
    const task = [{
      keyword,
      location_name: locationName,
      language_name: 'English',
      include_serp_info: true,
      limit: 100,
    }]

    return this.request('/keywords_data/google/keyword_suggestions/task_post', task)
  }

  async getKeywordDifficulty(keywords: string[], locationName: string = 'United States') {
    const task = [{
      keywords,
      location_name: locationName,
      language_name: 'English',
    }]

    return this.request('/keywords_data/google/keyword_difficulty/task_post', task)
  }

  // SERP analysis
  async getSerpData(keyword: string, locationName: string = 'United States') {
    const task = [{
      keyword,
      location_name: locationName,
      language_name: 'English',
      device: 'desktop',
      os: 'windows',
    }]

    return this.request('/serp/google/organic/task_post', task)
  }

  // Competitor analysis
  async getCompetitorData(domain: string, locationName: string = 'United States') {
    const task = [{
      target: domain,
      location_name: locationName,
      language_name: 'English',
      limit: 100,
    }]

    return this.request('/dataforseo_labs/google/competitors_domain/task_post', task)
  }

  // Get task results
  async getTaskResult(taskId: string) {
    return this.request(`/keywords_data/google/search_volume/task_get/${taskId}`)
  }

  // Combined keyword analysis
  async analyzeKeywords(keywords: string[], locationName: string = 'United States'): Promise<KeywordData[]> {
    try {
      // Get search volume and difficulty
      const [volumeResponse, difficultyResponse, suggestionsResponse] = await Promise.all([
        this.getKeywordData(keywords, locationName),
        this.getKeywordDifficulty(keywords, locationName),
        this.getKeywordSuggestions(keywords[0], locationName) // Get suggestions for first keyword
      ])

      // Process results (this would need to be adapted based on actual API response structure)
      const keywordResults: KeywordData[] = keywords.map((keyword, index) => ({
        keyword,
        searchVolume: 0, // Extract from volumeResponse
        difficulty: 0, // Extract from difficultyResponse
        cpc: 0, // Extract from response
        competition: 'medium', // Extract from response
        relatedKeywords: [] // Extract from suggestionsResponse
      }))

      return keywordResults
    } catch (error) {
      console.error('Error analyzing keywords:', error)
      throw error
    }
  }

  // Test connection
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        method: 'GET',
        headers: {
          'Authorization': this.authHeader,
        },
      })

      if (response.ok) {
        const data = await response.json()
        return { success: true, data }
      } else {
        return { success: false, error: 'Authentication failed' }
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export const createDataForSeoClient = (config: DataForSeoConfig) => {
  return new DataForSeoClient(config)
}
