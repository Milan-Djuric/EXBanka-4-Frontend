import { createContext, useContext, useState, useEffect } from 'react'
import { clientAccountService } from '../services/clientAccountService'

const ClientAccountsContext = createContext()

export function ClientAccountsProvider({ children }) {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  async function reload() {
    setLoading(true)
    try {
      const data = await clientAccountService.getMyAccounts()
      setAccounts(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function renameAccount(id, newAccountName) {
    await clientAccountService.renameAccount(id, newAccountName)
    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a
        a.accountName = newAccountName
        return a
      })
    )
  }

  useEffect(() => { reload() }, [])

  return (
    <ClientAccountsContext.Provider value={{ accounts, loading, error, reload, renameAccount }}>
      {children}
    </ClientAccountsContext.Provider>
  )
}

export function useClientAccounts() {
  return useContext(ClientAccountsContext)
}
