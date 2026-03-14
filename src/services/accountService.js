import { mockBankAccounts } from '../mocks/bankAccounts'
import { BankAccount } from '../models/BankAccount'

// In-memory store. Replace function bodies with real API calls when backend is ready.
let _accounts = mockBankAccounts.map((a) => new BankAccount(a))

export const accountService = {
  async getAccounts() {
    return [..._accounts]
  },
}
