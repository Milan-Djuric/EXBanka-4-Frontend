/**
 * Client account service (mock)
 *
 * Returns the logged-in client's own accounts.
 * Replace function bodies with real API calls when backend is ready.
 */

import { mockClientAccounts } from '../mocks/clientAccounts'

// In-memory copy so name edits etc. can be persisted within a session
let _accounts = [...mockClientAccounts]

export const clientAccountService = {
  async getMyAccounts() {
    return [..._accounts]
  },

  async getAccountById(id) {
    return _accounts.find((a) => a.id === id) ?? null
  },
}
