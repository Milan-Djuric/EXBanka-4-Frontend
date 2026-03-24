/**
 * Feature: Upravljanje primaocima plaćanja (Payment Recipients)
 * Scenarios: 21–23
 */

const CLIENT_EMAIL    = 'ddimitrijevi822rn@raf.rs'
const CLIENT_PASSWORD = 'taraDunjic123'

// A valid account number that passes isValidAccountNumber (format: 265-0000000000000-00)
const VALID_ACCOUNT = '265-1234567890123-45'

describe('Upravljanje primaocima plaćanja — klijent', () => {

  beforeEach(() => {
    cy.visit('/client/login')
    cy.get('input[name="email"]').type(CLIENT_EMAIL)
    cy.get('input[name="password"]').type(CLIENT_PASSWORD)
    cy.get('button[type="submit"]').click()
    cy.url().should('not.include', '/login')

    // Intercept the recipients fetch so we can wait for it to complete
    // before interacting — ensures React finishes all async re-renders
    cy.intercept('GET', '**/api/recipients*').as('loadRecipients')
    cy.visit('/client/recipients')
    cy.wait('@loadRecipients')
    cy.contains('h1', 'Recipients').should('be.visible')
  })

  // ── Scenario 21 ─────────────────────────────────────────────────────────────

  it('Scenario 21: dodaje novog primaoca i pojavljuje se u listi', () => {
    const recipientName = `Test Primalac ${Date.now()}`

    // When: klikne na dugme "Dodaj"
    cy.contains('+ Add recipient').click({ force: true })

    // Modal opens
    cy.contains('Add recipient').should('be.visible')

    // And: unese naziv primaoca i broj računa
    cy.get('input[name="name"]').type(recipientName)
    cy.get('input[name="accountNumber"]').type(VALID_ACCOUNT)

    // And: klikne na dugme "Potvrdi"
    cy.get('button[type="submit"]').click()

    // Then: novi primalac se dodaje u listu
    cy.contains(recipientName).should('be.visible')
    cy.contains(VALID_ACCOUNT).should('be.visible')

    // And: success toast potvrđuje dodavanje
    cy.contains(`${recipientName} added to recipients.`).should('be.visible')

    // And: primalac je dostupan za buduća plaćanja (Pay dugme postoji u redu)
    cy.contains('tr', recipientName).within(() => {
      cy.contains('Pay').should('be.visible')
    })
  })

  // ── Scenario 22 ─────────────────────────────────────────────────────────────

  it('Scenario 22: izmena podataka primaoca — ažurirani podaci se prikazuju u listi', () => {
    // Prerequisite: add a recipient to edit
    const originalName = `Primalac Za Izmenu ${Date.now()}`
    const updatedName  = `Izmenjen Primalac ${Date.now()}`
    const updatedAccount = '265-9999999999999-99'

    // Add via the UI so the test is self-contained
    cy.contains('+ Add recipient').click({ force: true })
    cy.get('input[name="name"]').type(originalName)
    cy.get('input[name="accountNumber"]').type(VALID_ACCOUNT)
    cy.get('button[type="submit"]').click()
    cy.contains(`${originalName} added to recipients.`).should('be.visible')

    // Given: postoji sačuvan primalac u listi
    cy.contains('tr', originalName).should('be.visible')

    // When: klikne na dugme "Izmeni" pored primaoca
    cy.contains('tr', originalName).within(() => {
      cy.contains('Edit').click()
    })

    // Edit modal opens with pre-filled values
    cy.contains('Edit recipient').should('be.visible')
    cy.get('input[name="name"]').should('have.value', originalName)

    // And: promeni naziv i broj računa
    cy.get('input[name="name"]').clear().type(updatedName)
    cy.get('input[name="accountNumber"]').clear().type(updatedAccount)

    // And: potvrdi izmene
    cy.contains('button', 'Save').click()

    // Then: sistem čuva nove podatke
    cy.contains(`${updatedName} updated successfully.`).should('be.visible')

    // And: ažurirani podaci se prikazuju u listi
    cy.contains(updatedName).should('be.visible')
    cy.contains(updatedAccount).should('be.visible')
    cy.contains(originalName).should('not.exist')
  })

  // ── Scenario 23 ─────────────────────────────────────────────────────────────

  it('Scenario 23: brisanje primaoca uklanja ga iz liste', () => {
    // Prerequisite: add a recipient to delete
    const recipientName = `Primalac Za Brisanje ${Date.now()}`

    cy.contains('+ Add recipient').click({ force: true })
    cy.get('input[name="name"]').type(recipientName)
    cy.get('input[name="accountNumber"]').type(VALID_ACCOUNT)
    cy.get('button[type="submit"]').click()
    cy.contains(`${recipientName} added to recipients.`).should('be.visible')

    // Given: u listi postoji sačuvan primalac
    cy.contains('tr', recipientName).should('be.visible')

    // When: klikne na dugme "Obriši" pored primaoca
    cy.contains('tr', recipientName).within(() => {
      cy.contains('Delete').click()
    })

    // Confirmation modal appears
    cy.contains('Delete recipient').should('be.visible')
    cy.contains(recipientName).should('be.visible')

    // Confirm deletion
    cy.get('button.bg-red-500').click()

    // Then: primalac se uklanja iz liste
    cy.contains(`${recipientName} removed from recipients.`).should('be.visible')

    // Scope to table — the "added" toast from the prerequisite step is still
    // visible so we can't assert on the whole document
    cy.get('table').should('not.contain', recipientName)

    // And: više nije dostupan za buduća plaćanja — no Pay button for this recipient
    cy.get('table').contains(recipientName).should('not.exist')
  })
})
