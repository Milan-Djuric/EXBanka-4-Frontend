/**
 * Client Auth Service (mock)
 *
 * Authenticates bank clients against the in-memory mock client list.
 * Mock password for every client: "client123"
 *
 * Replace the body of `login` with a real API call once the backend is ready.
 */

import { mockClients } from '../mocks/clients'

const MOCK_PASSWORD = 'client123'

export const clientAuthService = {
  async login(email, password) {
    const client = mockClients.find(
      (c) => c.email.toLowerCase() === email.trim().toLowerCase()
    )
    if (!client || password !== MOCK_PASSWORD) {
      throw new Error('Invalid email or password.')
    }
    return {
      id:          client.id,
      firstName:   client.firstName,
      lastName:    client.lastName,
      email:       client.email,
      phoneNumber: client.phoneNumber,
      address:     client.address,
      username:    client.username,
      dateOfBirth: client.dateOfBirth,
      gender:      client.gender,
    }
  },

  async logout() {
    // nothing to do in mock; clear tokens here when backend is ready
  },
}
