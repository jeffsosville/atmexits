export const atmVertical = {
  id: 'atm',
  info: {
    name: 'ATM Exits',
    slug: 'atm',
    domain: 'atmexits.com',
    brandColor: '#2d6a4f',
    logoPath: '/images/logo.png',
    faviconPath: '/favicon.ico',
  },
  seo: {
    metaTitle: 'ATM Routes for Sale | ATM Exits',
    metaDescription: 'Small and mid-size ATM routes for sale. Verified listings, direct to the seller.',
    keywords: ['ATM route for sale', 'buy ATM route', 'sell ATM business'],
    ogImage: '/images/og-atmexits.png',
    twitterCard: 'summary_large_image' as const,
  },
  categories: [
    { id: 'small-route', name: 'Small route', description: '1–10 machines' },
    { id: 'mid-route', name: 'Mid-size route', description: '11–50 machines' },
    { id: 'large-route', name: 'Large route', description: '50+ machines' },
  ],
  valuationMultiples: {
    revenueMin: 1.5, revenueMax: 3.5, revenueMedian: 2.5,
    sdeMin: 2.0, sdeMax: 4.0, sdeMedian: 3.0,
  },
  brokerSources: [] as any[],
  emailTemplates: {
    welcome: { subject: 'Welcome to ATM Exits', headerText: 'You\'re in.', ctaText: 'Browse ATM routes' },
    weeklyTop10: { subject: 'This week\'s ATM routes', headerText: 'New routes', introText: 'Latest verified ATM routes.' },
    newListing: { subject: 'New ATM route listed', headerText: 'A new route matches your criteria' },
    priceChange: { subject: 'Price update', headerText: 'Price changed' },
    fromEmail: 'hello@atmexits.com',
    fromName: 'ATM Exits',
  },
  terminology: {
    businessTerm: 'ATM route',
    businessTermPlural: 'ATM routes',
    revenueTerm: 'Gross surcharge revenue',
    profitTerm: 'Net cashflow',
    customMetrics: [
      { key: 'machine_count', label: 'Machines', description: 'Number of ATMs', format: 'number' as const },
      { key: 'gross_monthly_surcharge', label: 'Gross monthly surcharge', description: 'Total monthly surcharge', format: 'currency' as const },
    ],
  },
} as const;
