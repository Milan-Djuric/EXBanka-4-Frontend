import useWindowTitle from '../../hooks/useWindowTitle'
import ClientPortalLayout from '../../layouts/ClientPortalLayout'

export default function ClientLoansPage() {
  useWindowTitle('Loans | AnkaBanka')

  return (
    <ClientPortalLayout>
      <div className="px-8 py-8 max-w-4xl mx-auto w-full">
        <h1 className="font-serif text-3xl font-light text-slate-900 dark:text-white mb-1">Loans</h1>
        <div className="w-8 h-px bg-violet-500 dark:bg-violet-400 mb-8" />
        <p className="text-sm text-slate-400 dark:text-slate-500 font-light">Coming soon.</p>
      </div>
    </ClientPortalLayout>
  )
}
