/**
 * Mock accounts for the logged-in client.
 * Replace with GET /api/accounts/my when backend is ready.
 *
 * These represent the current logged-in client's own accounts as seen in the
 * client portal. Not to be confused with src/mocks/bankAccounts.js, which
 * is the employee-portal view of all accounts.
 */
export const mockClientAccounts = [
  {
    id: 1,
    accountNumber:  '265-0000000123456-78',
    accountName:    'Standard Current',
    currency:       'RSD',
    balance:         123_456.00,
    availableBalance: 121_234.00,
    type:           'personal',
    subtype:        'standard',
    status:         'active',
    dailyLimit:     250_000.00,
    monthlyLimit:  1_000_000.00,
    dailySpending:    2_222.00,
    monthlySpending:  18_450.00,
  },
  {
    id: 2,
    accountNumber:  '265-0000000234567-89',
    accountName:    'Savings',
    currency:       'RSD',
    balance:         45_000.00,
    availableBalance: 45_000.00,
    type:           'personal',
    subtype:        'savings',
    status:         'active',
    dailyLimit:     100_000.00,
    monthlyLimit:   500_000.00,
    dailySpending:        0,
    monthlySpending:      0,
  },
  {
    id: 3,
    accountNumber:  '265-0000000345678-90',
    accountName:    'Foreign Currency',
    currency:       'EUR',
    balance:            850.00,
    availableBalance:   850.00,
    type:           'personal',
    subtype:        'standard',
    status:         'active',
    dailyLimit:       5_000.00,
    monthlyLimit:    20_000.00,
    dailySpending:        0,
    monthlySpending:    120.00,
  },
]
