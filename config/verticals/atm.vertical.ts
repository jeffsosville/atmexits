export const atmVertical = {
  id: 'atm',
  name: 'ATM Exits',
  domain: 'atmexits.com',
  tagline: 'The only trusted marketplace for verified ATM routes',
  description: 'Buy and sell ATM routes with confidence. Every listing verified by ATM Brokerage — the team behind 200+ closed ATM route transactions.',
  primaryColor: '#1a3a2a',
  accentColor: '#2d6a4f',
  
  listing: {
    noun: 'ATM route',
    nounPlural: 'ATM routes',
    verb: 'sell your ATM route',
  },

  intake: {
    steps: [
      'Business overview',
      'Machine details',
      'Financial performance',
      'Processor & wireless',
      'Asking price & notes',
    ]
  },

  qualitySignals: [
    'machine_count',
    'gross_monthly_surcharge',
    'net_monthly_cashflow',
    'processor',
    'ownership_type',
  ]
}
