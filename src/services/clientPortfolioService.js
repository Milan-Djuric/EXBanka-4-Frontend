import { clientApiClient } from './clientApiClient'

export const clientPortfolioService = {
  async getPortfolio() {
    const { data } = await clientApiClient.get('/client/portfolio')
    return data
  },

  async getProfit() {
    const { data } = await clientApiClient.get('/client/portfolio/profit')
    return data
  },

  async setPublicMode(ticker, isPublic) {
    const { data } = await clientApiClient.put(`/client/portfolio/${ticker}/public-mode`, { isPublic })
    return data
  },
}
