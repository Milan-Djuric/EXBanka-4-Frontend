import { apiClient } from './apiClient'

export const portfolioService = {
  async getPortfolio() {
    const { data } = await apiClient.get('/portfolio')
    return data
  },

  async getProfit() {
    const { data } = await apiClient.get('/portfolio/profit')
    return data
  },

  async getMyTax() {
    const { data } = await apiClient.get('/tax/my')
    return data
  },

  async setPublicMode(ticker, isPublic) {
    const { data } = await apiClient.put(`/client/portfolio/${ticker}/public-mode`, { isPublic })
    return data
  },
}
