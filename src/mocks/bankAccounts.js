import { BankAccount } from '../models/BankAccount'

const make = (data) => new BankAccount(data)

// Linked to mock clients in src/mocks/clients.js
export const mockBankAccounts = [
  // Milana Antonić (id: 1)
  make({ id: 1, accountNumber: '105-0000000001-12', ownerId: 1, ownerFirstName: 'Milana',     ownerLastName: 'Antonić',    type: 'personal', currencyType: 'current', currency: 'RSD' }),
  make({ id: 2, accountNumber: '105-0000000002-34', ownerId: 1, ownerFirstName: 'Milana',     ownerLastName: 'Antonić',    type: 'personal', currencyType: 'foreign', currency: 'EUR' }),
  // Bojan Đurić (id: 2)
  make({ id: 3, accountNumber: '105-0000000003-56', ownerId: 2, ownerFirstName: 'Bojan',      ownerLastName: 'Đurić',      type: 'business', currencyType: 'current', currency: 'RSD' }),
  // Katarina Kostić (id: 3)
  make({ id: 4, accountNumber: '105-0000000004-78', ownerId: 3, ownerFirstName: 'Katarina',   ownerLastName: 'Kostić',     type: 'personal', currencyType: 'current', currency: 'RSD' }),
  // Aleksandra Lazarević (id: 4)
  make({ id: 5, accountNumber: '105-0000000005-90', ownerId: 4, ownerFirstName: 'Aleksandra', ownerLastName: 'Lazarević',  type: 'business', currencyType: 'foreign', currency: 'USD' }),
  // Nemanja Milošević (id: 5)
  make({ id: 6, accountNumber: '105-0000000006-11', ownerId: 5, ownerFirstName: 'Nemanja',    ownerLastName: 'Milošević',  type: 'personal', currencyType: 'current', currency: 'RSD' }),
  make({ id: 7, accountNumber: '105-0000000007-22', ownerId: 5, ownerFirstName: 'Nemanja',    ownerLastName: 'Milošević',  type: 'business', currencyType: 'current', currency: 'RSD' }),
  // Tanja Savić (id: 6)
  make({ id: 8, accountNumber: '105-0000000008-33', ownerId: 6, ownerFirstName: 'Tanja',      ownerLastName: 'Savić',      type: 'personal', currencyType: 'foreign', currency: 'CHF' }),
]
