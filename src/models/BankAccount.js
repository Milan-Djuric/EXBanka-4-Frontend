export class BankAccount {
  constructor({ id, accountNumber, ownerId, ownerFirstName, ownerLastName, type, currencyType }) {
    this.id            = id
    this.accountNumber = accountNumber
    this.ownerId       = ownerId
    this.ownerFirstName = ownerFirstName
    this.ownerLastName  = ownerLastName
    this.type          = type          // 'personal' | 'business'
    this.currencyType  = currencyType  // 'current' | 'foreign'
  }

  get ownerFullName() {
    return `${this.ownerFirstName} ${this.ownerLastName}`
  }
}
