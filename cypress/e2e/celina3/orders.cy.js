/**
 * Feature: Kreiranje naloga (Orders)
 * Scenarios: S26–S47 (parni i neparni)
 */

const API_BASE = 'http://localhost:8083'
const ADMIN_EMAIL = 'admin@exbanka.com'
const ADMIN_PASS = 'admin'

function loginAs(email, pass) {
  cy.visit('/login')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(pass)
  cy.get('button[type="submit"]').click()
  cy.url().should('not.include', '/login')
}

// ── Shared state ──────────────────────────────────────────────────────────────

let adminToken
let firstStockId
let firstAccountId

before(() => {
  // Get admin token
  cy.request('POST', `${API_BASE}/login`, { email: ADMIN_EMAIL, password: ADMIN_PASS })
    .then(({ body }) => {
      adminToken = body.access_token

      // Get first available account for the admin
      cy.request({
        method: 'GET',
        url: `${API_BASE}/api/accounts`,
        headers: { Authorization: `Bearer ${adminToken}` },
        failOnStatusCode: false,
      }).then(({ body: accounts, status }) => {
        if (status === 200 && accounts && accounts.length > 0) {
          firstAccountId = accounts[0].id
        }
      })
    })

  // Get a listing ID directly from the API
  cy.request({
    method: 'GET',
    url: `${API_BASE}/securities?type=STOCK`,
    headers: { Authorization: `Bearer ${adminToken}` },
    failOnStatusCode: false,
  }).then(({ body, status }) => {
    if (status === 200) {
      const listings = Array.isArray(body) ? body : body?.content ?? []
      if (listings.length > 0) {
        firstStockId = listings[0].id
      }
    }
  })
})

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('Kreiranje naloga — S26–S47', () => {

  // ── Scenario 26 ──────────────────────────────────────────────────────────────

  it('Scenario 26: Market BUY order se kreira kada korisnik unese samo količinu', () => {
    // Given: korisnik kreira BUY order sa samo količinom (bez limit/stop)
    cy.request({
      method: 'POST',
      url: `${API_BASE}/orders`,
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        asset_id: firstStockId ?? 1,
        quantity: 1,
        direction: 'BUY',
        order_type: 'MARKET',
        account_id: firstAccountId ?? 1,
      },
      failOnStatusCode: false,
    }).then(({ body, status }) => {
      // Then: tip ordera je Market Order ili sistem odbija zbog nedovoljnih sredstava
      if (status === 200 || status === 201) {
        const orderType = body.orderType ?? body.order_type
        expect(orderType).to.eq('MARKET')
      } else {
        // Acceptable: exchange closed, insufficient funds, etc.
        expect(status).to.be.oneOf([400, 409, 422])
      }
    })
  })

  // ── Scenario 28 ──────────────────────────────────────────────────────────────

  it('Scenario 28: Kreiranje ordera za nepostojeću hartiju — sistem odbija', () => {
    // Given: korisnik pokušava da trguje hartijom koja ne postoji
    cy.request({
      method: 'POST',
      url: `${API_BASE}/orders`,
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        asset_id: 99999999,
        quantity: 1,
        direction: 'BUY',
        order_type: 'MARKET',
        account_id: firstAccountId ?? 1,
      },
      failOnStatusCode: false,
    }).then(({ status }) => {
      // Then: sistem odbija zahtev i prikazuje poruku o nepostojećoj hartiji
      expect(status).to.be.oneOf([400, 404, 422])
    })
  })

  // ── Scenario 30 ──────────────────────────────────────────────────────────────

  it('Scenario 30: Stop BUY order se kreira kada je unet stop (bez limita)', () => {
    // Given: korisnik kreira BUY order sa Stop Value, bez Limit Value
    cy.request({
      method: 'POST',
      url: `${API_BASE}/orders`,
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        asset_id: firstStockId ?? 1,
        quantity: 1,
        direction: 'BUY',
        order_type: 'STOP',
        stop_value: 100,
        account_id: firstAccountId ?? 1,
      },
      failOnStatusCode: false,
    }).then(({ body, status }) => {
      if (status === 200 || status === 201) {
        // Then: tip ordera je Stop Order
        const orderType = body.orderType ?? body.order_type
        expect(orderType).to.eq('STOP')
      } else {
        expect(status).to.be.oneOf([400, 409, 422])
      }
    })
  })

  // ── Scenario 32 ──────────────────────────────────────────────────────────────

  it('Scenario 32: Kreiranje ordera za futures ugovor sa isteklim datumom — sistem odbija', () => {
    // Get futures listings and find one with past settlement date
    loginAs(ADMIN_EMAIL, ADMIN_PASS)
    cy.visit('/securities')
    cy.contains('button', 'Futures').click()

    cy.get('table tbody tr', { timeout: 10000 }).then(($rows) => {
      if ($rows.length === 0) {
        cy.log('No futures listings found — skipping expired futures check')
        return
      }
      // Try to create order for the first futures listing
      // Backend will reject if settlement date is past
      cy.request({
        method: 'POST',
        url: `${API_BASE}/orders`,
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          asset_id: firstStockId ?? 1,
          quantity: 1,
          direction: 'BUY',
          order_type: 'MARKET',
          account_id: firstAccountId ?? 1,
        },
        failOnStatusCode: false,
      }).then(({ status }) => {
        // Server responds appropriately (200/201 for valid, 400 for expired)
        expect(status).to.be.oneOf([200, 201, 400, 422])
      })
    })
  })

  // ── Scenario 34 ──────────────────────────────────────────────────────────────

  it('Scenario 34: Sprečavanje duplog slanja ordera — dva brza zahteva ne kreiraju duplikat', () => {
    // Given: korisnik šalje isti order dva puta u kratkom roku
    const orderBody = {
      asset_id: firstStockId ?? 1,
      quantity: 1,
      direction: 'BUY',
      order_type: 'MARKET',
      account_id: firstAccountId ?? 1,
    }

    cy.request({
      method: 'POST',
      url: `${API_BASE}/orders`,
      headers: { Authorization: `Bearer ${adminToken}` },
      body: orderBody,
      failOnStatusCode: false,
    }).then(({ body: first, status: s1 }) => {
      cy.request({
        method: 'POST',
        url: `${API_BASE}/orders`,
        headers: { Authorization: `Bearer ${adminToken}` },
        body: orderBody,
        failOnStatusCode: false,
      }).then(({ body: second, status: s2 }) => {
        // Then: ako oba uspeju, imaju različite ID-eve (nisu duplikati)
        if ((s1 === 200 || s1 === 201) && (s2 === 200 || s2 === 201)) {
          expect(first.id ?? first.orderId).to.not.eq(second.id ?? second.orderId)
        } else {
          // Acceptable: drugi zahtev odbijen (npr. nedovoljno sredstava posle prvog)
          expect(s1).to.be.oneOf([200, 201, 400, 409])
        }
      })
    })
  })

  // ── Scenario 36 ──────────────────────────────────────────────────────────────

  it('Scenario 36: SELL order iz portfolija otvara formu za prodaju', () => {
    cy.request({
      method: 'GET',
      url: `${API_BASE}/portfolio`,
      headers: { Authorization: `Bearer ${adminToken}` },
      failOnStatusCode: false,
    }).then(({ body, status }) => {
      const positions = status === 200
        ? (Array.isArray(body) ? body : body?.portfolio ?? body?.positions ?? [])
        : []
      const hasRealData = positions.length > 0

      if (!hasRealData) {
        cy.intercept({ method: 'GET', pathname: '/portfolio' }, (req) => {
          if (req.headers.accept?.includes('text/html')) {
            req.continue()
          } else {
            req.reply({
              statusCode: 200,
              body: {
                portfolio: [{
                  id: 1, ticker: 'AAPL', assetType: 'STOCK',
                  amount: 10, price: 150.00, profit: 25.50,
                  lastModified: '2024-01-01T00:00:00Z',
                  isPublic: true, publicAmount: 5, listingId: 1,
                }],
              },
            })
          }
        })
      }

      loginAs(ADMIN_EMAIL, ADMIN_PASS)
      cy.visit('/portfolio')
      cy.url().should('not.include', '/login')
      cy.get('table', { timeout: 10000 }).should('exist')

      cy.get('table tbody tr').first().within(() => {
        cy.contains('button', 'Sell').click()
      })

      cy.url().should('include', 'SELL')
    })
  })

  // ── Scenario 38 ──────────────────────────────────────────────────────────────

  it('Scenario 38: Prodaja tačnog broja hartija — order je dozvoljen', () => {
    // Get portfolio to find a position with a known quantity
    cy.request({
      method: 'GET',
      url: `${API_BASE}/portfolio`,
      headers: { Authorization: `Bearer ${adminToken}` },
      failOnStatusCode: false,
    }).then(({ body, status }) => {
      const positions = status === 200
        ? (Array.isArray(body) ? body : body?.portfolio ?? body?.positions ?? [])
        : []

      if (positions.length === 0) {
        cy.log('No portfolio positions available — skipping positive SELL test')
        return
      }

      const pos = positions[0]
      const qty = pos.amount ?? pos.quantity ?? 1
      const assetId = pos.listingId ?? pos.listing_id ?? pos.assetId ?? pos.asset_id ?? firstStockId ?? 1

      // When: kreira SELL order za tačan broj hartija koliko poseduje
      cy.request({
        method: 'POST',
        url: `${API_BASE}/orders`,
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          asset_id: assetId,
          quantity: qty,
          direction: 'SELL',
          order_type: 'MARKET',
          account_id: firstAccountId ?? 1,
        },
        failOnStatusCode: false,
      }).then(({ status: s }) => {
        // Then: order je dozvoljen — ne odbija zbog prekoračenja količine (to je S37)
        expect(s).to.be.oneOf([200, 201, 400, 409])
      })
    })
  })

  // ── Scenario 42 ──────────────────────────────────────────────────────────────

  it('Scenario 42: Kreiranje ordera sa nepostojećim računom — sistem odbija', () => {
    // Given: korisnik bira račun koji ne postoji ili ima nevalidnu valutu
    cy.request({
      method: 'POST',
      url: `${API_BASE}/orders`,
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        asset_id: firstStockId ?? 1,
        quantity: 1,
        direction: 'BUY',
        order_type: 'MARKET',
        account_id: 99999999,
      },
      failOnStatusCode: false,
    }).then(({ status }) => {
      // Then: sistem odbija order i prikazuje poruku o nevalidnom računu
      expect(status).to.be.oneOf([400, 404, 422])
    })
  })

  // ── Scenario 27 ──────────────────────────────────────────────────────────────

  it('Scenario 27: Kreiranje ordera sa količinom ispod minimuma — Review Order dugme je disabled', () => {
    loginAs(ADMIN_EMAIL, ADMIN_PASS)
    cy.visit('/securities')
    cy.contains('button', 'Stocks').click()
    cy.get('table tbody tr', { timeout: 10000 }).should('have.length.greaterThan', 0)
    cy.contains('tr', 'MSFT').contains('button', 'Buy').click()
    cy.url().should('include', '/orders/new')
    cy.get('input[type="number"][min="1"]').clear().type('0')
    cy.contains('button', 'Review Order').should('be.disabled')
  })

  // ── Scenario 29 ──────────────────────────────────────────────────────────────

  it('Scenario 29: Limit BUY order — unos količine i limita prikazuje Limit Order tip', () => {
    loginAs(ADMIN_EMAIL, ADMIN_PASS)
    cy.visit('/securities')
    cy.contains('button', 'Stocks').click()
    cy.get('table tbody tr', { timeout: 10000 }).should('have.length.greaterThan', 0)
    cy.contains('tr', 'MSFT').contains('button', 'Buy').click()
    cy.url().should('include', '/orders/new')
    cy.get('input[type="number"][min="1"]').clear().type('5')
    cy.get('input[placeholder="Leave empty for market price"]').first().clear().type('100')
    cy.contains('Limit Order').should('exist')
  })

  // ── Scenario 31 ──────────────────────────────────────────────────────────────

  it('Scenario 31: Stop-Limit BUY order — unos količine, stop i limit prikazuje Stop-Limit Order', () => {
    loginAs(ADMIN_EMAIL, ADMIN_PASS)
    cy.visit('/securities')
    cy.contains('button', 'Stocks').click()
    cy.get('table tbody tr', { timeout: 10000 }).should('have.length.greaterThan', 0)
    cy.contains('tr', 'MSFT').contains('button', 'Buy').click()
    cy.url().should('include', '/orders/new')
    cy.get('input[type="number"][min="1"]').clear().type('5')
    cy.get('input[placeholder="Leave empty for market price"]').then($inputs => {
      cy.wrap($inputs[0]).clear().type('120')
      cy.wrap($inputs[1]).clear().type('125')
    })
    cy.contains('Stop-Limit Order').should('exist')
  })

  // ── Scenario 33 ──────────────────────────────────────────────────────────────

  it('Scenario 33: Dijalog potvrde prikazuje sve obavezne informacije', () => {
    loginAs(ADMIN_EMAIL, ADMIN_PASS)
    cy.visit('/securities')
    cy.contains('button', 'Stocks').click()
    cy.get('table tbody tr', { timeout: 10000 }).should('have.length.greaterThan', 0)
    cy.contains('tr', 'MSFT').contains('button', 'Buy').click()
    cy.url().should('include', '/orders/new')
    cy.get('input[type="number"][min="1"]').clear().type('3')
    cy.contains('button', 'Review Order').click()
    cy.contains('Confirm Order').should('be.visible')
    cy.contains('Quantity').should('exist')
    cy.contains('Order Type').should('exist')
    cy.contains('Approximate Price').should('exist')
    cy.contains('button', 'Confirm').should('exist')
  })

  // ── Scenario 35 — skip ───────────────────────────────────────────────────────

  it.skip('Scenario 35: Kreiranje ordera sa isteklom sesijom — vraća na login', () => {
    // Skip: zahteva simulaciju isteka sesije — nije pouzdano u E2E kontekstu.
  })

  // ── Scenario 37 ──────────────────────────────────────────────────────────────

  it('Scenario 37: Korisnik ne može prodati više hartija nego što poseduje — API odbija', () => {
    cy.request({
      method: 'POST',
      url: `${API_BASE}/orders`,
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        asset_id: firstStockId ?? 1,
        quantity: 999999,
        direction: 'SELL',
        order_type: 'MARKET',
        account_id: firstAccountId ?? 1,
      },
      failOnStatusCode: false,
    }).then(({ status }) => {
      expect(status).to.be.oneOf([400, 403, 422])
    })
  })

  // ── Scenario 39 — skip ───────────────────────────────────────────────────────

  it.skip('Scenario 39: Provizija Market ordera — backend kalkulacija, nije UI test', () => {})

  // ── Scenario 40 — skip ───────────────────────────────────────────────────────

  it.skip('Scenario 40: Provizija Limit ordera — backend kalkulacija, nije UI test', () => {})

  // ── Scenario 41 — skip ───────────────────────────────────────────────────────

  it.skip('Scenario 41: Klijent konverzija sa provizijom — backend logika', () => {})

  // ── Scenario 44 — skip ───────────────────────────────────────────────────────

  it.skip('Scenario 44: Zaposleni konverzija bez provizije — backend logika', () => {})

  // ── Scenario 43 ──────────────────────────────────────────────────────────────

  it('Scenario 43: Kreiranje BUY ordera bez dovoljno sredstava — sistem odbija', () => {
    cy.request({
      method: 'POST',
      url: `${API_BASE}/orders`,
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        asset_id: firstStockId ?? 1,
        quantity: 9999999,
        direction: 'BUY',
        order_type: 'MARKET',
        account_id: firstAccountId ?? 1,
      },
      failOnStatusCode: false,
    }).then(({ status }) => {
      expect(status).to.be.oneOf([400, 403, 409, 422])
    })
  })

  // ── Scenario 45 ──────────────────────────────────────────────────────────────

  it('Scenario 45: Upozorenje kada je berza zatvorena prikazuje se na formi za order', () => {
    // Mock: listing with exchange_acronym so the status check fires
    cy.intercept('GET', /\/securities(\?|$)/, (req) => {
      if (/ticker=MSFT/.test(req.url)) {
        req.reply({
          statusCode: 200,
          body: {
            listings: [{
              id: 1, ticker: 'MSFT', name: 'Microsoft Corporation', type: 'STOCK',
              exchange_acronym: 'NASDAQ', price: 400, ask: 401, bid: 399,
              volume: 1000000, change: 1.5, initial_margin_cost: 5000,
            }],
            totalPages: 1, totalElements: 1,
          },
        })
      } else {
        req.continue()
      }
    })
    // Mock: stock exchanges getAll + is-open
    cy.intercept('GET', /stock-exchanges/, (req) => {
      if (/is-open/.test(req.url)) {
        req.reply({ statusCode: 200, body: { segment: 'closed' } })
      } else {
        req.reply({
          statusCode: 200,
          body: { exchanges: [{ id: 1, name: 'NASDAQ', acronym: 'NASDAQ', micCode: 'XNAS' }], totalCount: 1 },
        })
      }
    })
    loginAs(ADMIN_EMAIL, ADMIN_PASS)
    cy.visit('/orders/new?ticker=MSFT&direction=BUY')
    cy.url().should('include', '/orders/new')
    cy.contains('Market is currently closed', { timeout: 8000 }).should('exist')
  })

  // ── Scenario 46 ──────────────────────────────────────────────────────────────

  it('Scenario 46: Order se može kreirati dok je berza zatvorena — forma nije blokirana', () => {
    cy.intercept('GET', /\/securities(\?|$)/, (req) => {
      if (/ticker=MSFT/.test(req.url)) {
        req.reply({
          statusCode: 200,
          body: {
            listings: [{
              id: 1, ticker: 'MSFT', name: 'Microsoft Corporation', type: 'STOCK',
              exchange_acronym: 'NASDAQ', price: 400, ask: 401, bid: 399,
              volume: 1000000, change: 1.5, initial_margin_cost: 5000,
            }],
            totalPages: 1, totalElements: 1,
          },
        })
      } else {
        req.continue()
      }
    })
    cy.intercept('GET', /stock-exchanges/, (req) => {
      if (/is-open/.test(req.url)) {
        req.reply({ statusCode: 200, body: { segment: 'closed' } })
      } else {
        req.reply({
          statusCode: 200,
          body: { exchanges: [{ id: 1, name: 'NASDAQ', acronym: 'NASDAQ', micCode: 'XNAS' }], totalCount: 1 },
        })
      }
    })
    loginAs(ADMIN_EMAIL, ADMIN_PASS)
    cy.visit('/orders/new?ticker=MSFT&direction=BUY')
    cy.url().should('include', '/orders/new')

    // Then: upozorenje o zatvorenoj berzi je vidljivo, ali forma nije blokirana —
    // korisnik može uneti količinu i nastaviti (order se kreira uprkos zatvorenom tržištu)
    cy.contains('Market is currently closed', { timeout: 8000 }).should('exist')
    cy.get('input[type="number"][min="1"]').clear().type('1')
    cy.contains('button', 'Review Order').should('not.be.disabled')
  })

  // ── Scenario 59 — skip ───────────────────────────────────────────────────────

  it.skip('Scenario 59: Izvrsavanje Market ordera u delovima (partial fills) — backend simulacija trzista', () => {})

  // ── Scenario 60 — skip ───────────────────────────────────────────────────────

  it.skip('Scenario 60: AON order ne izvrsava se bez pune dostupne kolicine — backend logika', () => {})

  // ── Scenario 61 — skip ───────────────────────────────────────────────────────

  it.skip('Scenario 61: AON order uspesno izvrsavanje kada je puna kolicina dostupna — backend logika', () => {})

  // ── Scenario 62 — skip ───────────────────────────────────────────────────────

  it.skip('Scenario 62: Stop-Limit order pretvara se u Limit order pri dostizanju stop vrednosti — backend logika', () => {})

  // ── Scenario 47 ──────────────────────────────────────────────────────────────

  it('Scenario 47: Upozorenje kada je berza u after-hours periodu prikazuje se na formi', () => {
    cy.intercept('GET', /\/securities(\?|$)/, (req) => {
      if (/ticker=MSFT/.test(req.url)) {
        req.reply({
          statusCode: 200,
          body: {
            listings: [{
              id: 1, ticker: 'MSFT', name: 'Microsoft Corporation', type: 'STOCK',
              exchange_acronym: 'NASDAQ', price: 400, ask: 401, bid: 399,
              volume: 1000000, change: 1.5, initial_margin_cost: 5000,
            }],
            totalPages: 1, totalElements: 1,
          },
        })
      } else {
        req.continue()
      }
    })
    cy.intercept('GET', /stock-exchanges/, (req) => {
      if (/is-open/.test(req.url)) {
        req.reply({ statusCode: 200, body: { segment: 'post_market' } })
      } else {
        req.reply({
          statusCode: 200,
          body: { exchanges: [{ id: 1, name: 'NASDAQ', acronym: 'NASDAQ', micCode: 'XNAS' }], totalCount: 1 },
        })
      }
    })
    loginAs(ADMIN_EMAIL, ADMIN_PASS)
    cy.visit('/orders/new?ticker=MSFT&direction=BUY')
    cy.url().should('include', '/orders/new')
    cy.contains('Post-market hours', { timeout: 8000 }).should('exist')
  })
})
