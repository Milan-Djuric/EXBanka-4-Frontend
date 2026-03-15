import { mockBankAccounts } from '../mocks/bankAccounts'
import { BankAccount } from '../models/BankAccount'

// In-memory store. Replace function bodies with real API calls when backend is ready.
let _accounts = mockBankAccounts.map((a) => new BankAccount(a))

let _nextId = mockBankAccounts.length + 1

function generateAccountNumber() {
  const padded = String(_nextId).padStart(10, '0')
  const check  = String(_nextId % 100).padStart(2, '0')
  return `105-${padded}-${check}`
}

export const accountService = {
  async getAccounts() {
    return [..._accounts]
  },

  async getAccountById(id) {
    return _accounts.find((a) => a.id === id) ?? null
  },

  async createAccount({ ownerId, ownerFirstName, ownerLastName, type, currencyType, currency, createdByEmployeeId }) {
    const account = new BankAccount({
      id: _nextId,
      accountNumber: generateAccountNumber(),
      ownerId,
      ownerFirstName,
      ownerLastName,
      type,
      currencyType,
      currency,
      createdByEmployeeId,
    })
    _nextId++
    _accounts = [..._accounts, account]
    return account
  },
}
