import { createContext, useContext, useState, useEffect } from 'react'
import { paymentService } from '../services/paymentService'

const ClientPaymentsContext = createContext()

export function ClientPaymentsProvider({ children }) {
  const [payments, setPayments] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  async function reload() {
    setLoading(true)
    try {
      const data = await paymentService.getPayments()
      setPayments(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [])

  return (
    <ClientPaymentsContext.Provider value={{ payments, loading, error, reload }}>
      {children}
    </ClientPaymentsContext.Provider>
  )
}

export function useClientPayments() {
  return useContext(ClientPaymentsContext)
}
