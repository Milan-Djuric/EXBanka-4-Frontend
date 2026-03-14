import { createContext, useContext, useState } from 'react'
import { accountService } from '../services/accountService'

const AccountsContext = createContext()

export function AccountsProvider({ children }) {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function reload() {
    setLoading(true)
    setError(null)
    try {
      const data = await accountService.getAccounts()
      setAccounts(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AccountsContext.Provider value={{ accounts, loading, error, reload }}>
      {children}
    </AccountsContext.Provider>
  )
}

export function useAccounts() {
  return useContext(AccountsContext)
}
