import useWindowTitle from '../../hooks/useWindowTitle'

function AboutPage() {
  useWindowTitle('About | AnkaBanka Employee Portal')

  return (
    <div className="space-y-24">
      {/* Header */}
      <section className="text-center pt-4">
        <p className="section-label mb-6">Employee Portal</p>
        <h1 className="font-serif text-5xl sm:text-6xl font-light text-slate-900 mb-4">
          About This Portal
        </h1>
        <div className="gold-divider" />
      </section>

      {/* Description */}
      <section>
        <h2 className="font-serif text-4xl font-light text-slate-900 mb-6">What Is This?</h2>
        <div className="space-y-4 text-slate-500 font-light leading-relaxed max-w-2xl">
          <p>
            This is the AnkaBanka internal employee portal. It provides staff with access to the
            tools, systems, and information needed to carry out day-to-day banking operations.
          </p>
          <p>
            Access is restricted to authorized AnkaBanka employees. If you are having trouble signing
            in, contact your system administrator or IT support.
          </p>
        </div>
      </section>

      {/* Access info */}
      <section>
        <div className="mb-10">
          <h2 className="font-serif text-4xl font-light text-slate-900">Access & Support</h2>
          <div className="gold-divider mx-0 mt-4" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {info.map((item) => (
            <div key={item.title} className="border border-slate-200 p-8 hover:border-amber-400 transition-colors duration-200">
              <h3 className="font-serif text-xl font-light text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-500 text-sm font-light leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const info = [
  {
    title: 'Login',
    description: 'Use your company email address and employee password to sign in. Multi-factor authentication may be required.',
  },
  {
    title: 'Password Reset',
    description: 'Use the "Forgot password?" link on the login page. A reset link will be sent to your registered email.',
  },
  {
    title: 'Access Issues',
    description: 'If your account is locked or you lack access to a tool, contact IT support or your department manager.',
  },
  {
    title: 'Security',
    description: 'Do not share your credentials. Log out when leaving your workstation. Report any suspicious activity to IT.',
  },
]

export default AboutPage
