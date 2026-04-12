import { atmVertical } from './atm.vertical';

const verticals: Record<string, typeof atmVertical> = {
  atm: atmVertical,
};

const hostnameMappings = [
  { hostname: 'atmexits.com', verticalSlug: 'atm', isPrimary: true },
  { hostname: 'atmexits.vercel.app', verticalSlug: 'atm', isPrimary: false },
  { hostname: 'localhost', verticalSlug: 'atm', isPrimary: false },
];

const defaultSlug = 'atm';

export function getVerticalBySlug(slug: string) {
  return verticals[slug] || null;
}

export function getVerticalByHostname(hostname: string) {
  const normalizedHostname = hostname.split(':')[0].toLowerCase();
  const mapping = hostnameMappings.find((m) => m.hostname === normalizedHostname);
  const slug = mapping?.verticalSlug || defaultSlug;
  return verticals[slug] || verticals[defaultSlug];
}

export function getCurrentVertical(req?: { headers: { host?: string } }) {
  if (req?.headers.host) return getVerticalByHostname(req.headers.host);
  return verticals[defaultSlug];
}

export function getCurrentVerticalClient() {
  if (typeof window === 'undefined') return verticals[defaultSlug];
  return getVerticalByHostname(window.location.hostname);
}

export function getAllVerticals() {
  return Object.values(verticals);
}

export function getAllVerticalSlugs() {
  return Object.keys(verticals);
}

export function isValidVertical(slug: string) {
  return slug in verticals;
}

export function getPrimaryHostname(slug: string) {
  return hostnameMappings.find((m) => m.verticalSlug === slug && m.isPrimary)?.hostname || null;
}

export function getAllHostnames(slug: string) {
  return hostnameMappings.filter((m) => m.verticalSlug === slug).map((m) => m.hostname);
}
