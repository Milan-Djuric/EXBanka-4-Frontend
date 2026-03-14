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

  async function addAccount(data) {
    const created = await accountService.createAccount(data)
    setAccounts((prev) => [...prev, created])
    return created
  }

  return (
    <AccountsContext.Provider value={{ accounts, loading, error, reload, addAccount }}>
      {children}
    </AccountsContext.Provider>
  )
}

export function useAccounts() {
  return useContext(AccountsContext)
}
