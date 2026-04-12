import { VerticalConfig } from '../types';
import { atmVertical } from './atm.vertical';

const verticals: Record<string, VerticalConfig> = {
  atm: atmVertical,
};

const hostnameMappings = [
  { hostname: 'atmexits.com', verticalSlug: 'atm', isPrimary: true },
  { hostname: 'localhost', verticalSlug: 'atm', isPrimary: false },
];

const defaultSlug = 'atm';

export function getVerticalBySlug(slug: string): VerticalConfig | null {
  return verticals[slug] || null;
}

export function getVerticalByHostname(hostname: string): VerticalConfig {
  const normalizedHostname = hostname.split(':')[0].toLowerCase();
  const mapping = hostnameMappings.find((m) => m.hostname === normalizedHostname);
  const slug = mapping?.verticalSlug || defaultSlug;
  return verticals[slug] || verticals[defaultSlug];
}

export function getCurrentVertical(req?: { headers: { host?: string } }): VerticalConfig {
  if (req?.headers.host) {
    return getVerticalByHostname(req.headers.host);
  }
  return verticals[defaultSlug];
}

export function getCurrentVerticalClient(): VerticalConfig {
  if (typeof window === 'undefined') {
    return verticals[defaultSlug];
  }
  return getVerticalByHostname(window.location.hostname);
}

export function getAllVerticals(): VerticalConfig[] {
  return Object.values(verticals);
}

export function getAllVerticalSlugs(): string[] {
  return Object.keys(verticals);
}

export function isValidVertical(slug: string): boolean {
  return slug in verticals;
}

export function getPrimaryHostname(slug: string): string | null {
  const mapping = hostnameMappings.find((m) => m.verticalSlug === slug && m.isPrimary);
  return mapping?.hostname || null;
}

export function getAllHostnames(slug: string): string[] {
  return hostnameMappings
    .filter((m) => m.verticalSlug === slug)
    .map((m) => m.hostname);
}
