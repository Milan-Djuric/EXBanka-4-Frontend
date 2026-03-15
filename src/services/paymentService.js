/**
 * Payment service (mock — client portal)
 *
 * Returns payments for the logged-in client.
 * Replace function bodies with real API calls when backend is ready.
 */

import { MOCK_PAYMENTS } from '../mocks/payments'

export const paymentService = {
  async getPayments() {
    return [...MOCK_PAYMENTS]
  },

  async getPaymentById(id) {
    return MOCK_PAYMENTS.find((p) => p.id === id) ?? null
  },
}
