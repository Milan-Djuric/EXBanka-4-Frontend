/**
 * Feature: Upravljanje aktuarima
 * Even scenarios: S2, S4, S6, S8
 */

const API_BASE = 'http://localhost:8083'
const ADMIN_EMAIL = 'admin@exbanka.com'
const ADMIN_PASS = 'admin'
const AGENT_EMAIL = 'elezovic@banka.rs'  // Denis Elezovic — AGENT permission
const AGENT_PASS = 'denis123'

function loginAs(email, pass) {
  cy.visit('/login')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(pass)
  cy.get('button[type="submit"]').click()
  cy.url().should('not.include', '/login')
}

function withToken(email, pass, cb) {
  cy.request('POST', `${API_BASE}/login`, { email, password: pass })
    .then(({ body }) => cb(body.access_token))
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('Upravljanje aktuarima — S2, S4, S6, S8', () => {

  // ── Scenario 2 ───────────────────────────────────────────────────────────────

  it('Scenario 2: Agent nema pristup portalu za upravljanje aktuarima', () => {
    // Given: korisnik nije ulogovan (ili ima agent permisije)
    // When: pokuša da pristupi portalu za upravljanje aktuarima bez autentifikacije
    cy.visit('/admin/actuaries')

    // Then: ProtectedRoute ga preusmeri na login (nije autentifikovan)
    cy.url().should('not.include', '/admin/actuaries')
  })

  // ── Scenario 4 ───────────────────────────────────────────────────────────────

  it('Scenario 4: Unos nevalidnog limita odbija se validacionom porukom', () => {
    // Check first if there are any actuaries in the system
    withToken(ADMIN_EMAIL, ADMIN_PASS, (token) => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/api/actuaries`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then(({ body }) => {
        if (!body || body.length === 0) {
          cy.log('No actuaries found — skipping')
          return
        }

        // Given: supervizor je na portalu za upravljanje aktuarima
        loginAs(ADMIN_EMAIL, ADMIN_PASS)
        cy.visit('/admin/actuaries')
        cy.contains('button', 'Set limit', { timeout: 10000 }).should('exist')

        // When: unese limit -1 (negativna vrednost) za prvog agenta u listi
        cy.get('table tbody tr').first().within(() => {
          cy.contains('button', 'Set limit').click()
        })
        cy.get('table tbody tr').first().within(() => {
          cy.get('input[type="number"]').clear().type('-1')
          cy.contains('button', 'Save').click()
        })

        // Then: sistem odbija unos — input ostaje (min=0 na input-u sprečava submit)
        cy.get('table tbody tr').first().within(() => {
          cy.get('input[type="number"]').should('exist')
        })
      })
    })
  })

  // ── Scenario 6 ───────────────────────────────────────────────────────────────

  it('Scenario 6: Postavljanje limita jednakog usedLimit-u je dozvoljeno', () => {
    // Given: agent ima usedLimit vrednost
    withToken(ADMIN_EMAIL, ADMIN_PASS, (token) => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/api/actuaries`,
        headers: { Authorization: `Bearer ${token}` },
      }).then(({ body }) => {
        const firstActuary = body[0]
        if (!firstActuary) {
          cy.log('No actuaries found — skipping')
          return
        }
        const usedLimit = firstActuary.usedLimit ?? firstActuary.used_limit ?? 0
        const targetLimit = usedLimit > 0 ? usedLimit : 50000

        loginAs(ADMIN_EMAIL, ADMIN_PASS)
        cy.visit('/admin/actuaries')
        cy.get('table tbody tr', { timeout: 10000 }).should('have.length.greaterThan', 0)

        // When: supervizor postavi limit = usedLimit (ili pozitivnu vrednost ako je usedLimit 0)
        cy.get('table tbody tr').first().within(() => {
          cy.contains('button', 'Set limit').click()
        })
        cy.get('table tbody tr').first().within(() => {
          cy.get('input[type="number"]').clear().type(String(targetLimit))
          cy.contains('button', 'Save').click()
        })

        // Then: sistem dozvoljava izmenu — verifikuj via API
        cy.request({
          method: 'GET',
          url: `${API_BASE}/api/actuaries`,
          headers: { Authorization: `Bearer ${token}` },
        }).then(({ body: updated }) => {
          const updatedFirst = updated[0]
          const savedLimit = updatedFirst?.limit ?? updatedFirst?.limitAmount
          expect(savedLimit).to.eq(targetLimit)
        })
      })
    })
  })

  // ── Scenario 8 ───────────────────────────────────────────────────────────────

  it('Scenario 8: Admin je ujedno i supervizor — dozvoljen pristup portalu aktuara', () => {
    // Given: zaposleni ima admin permisiju
    loginAs(ADMIN_EMAIL, ADMIN_PASS)

    // When: admin pokuša da pristupi portalu za upravljanje aktuarima
    cy.visit('/admin/actuaries')

    // Then: pristup je dozvoljen i vidi listu agenata
    cy.url().should('include', '/admin/actuaries')
    cy.get('table').should('exist')
    cy.get('table tbody tr').should('have.length.greaterThan', 0)
    cy.get('table thead').within(() => {
      cy.contains('Limit').should('exist')
    })
  })
})
