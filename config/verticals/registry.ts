import { VerticalRegistry } from '../types';
import { atmVertical } from './atm.vertical';

export const verticalRegistry: VerticalRegistry = {
  verticals: {
    atm: atmVertical,
  },
  hostnameMappings: [
    { hostname: 'atmexits.com', verticalSlug: 'atm', isPrimary: true },
    { hostname: 'atmexits.vercel.app', verticalSlug: 'atm', isPrimary: false },
    { hostname: 'localhost', verticalSlug: 'atm', isPrimary: false },
  ],
  defaultVertical: 'atm',
};

export const defaultVertical = 'atm';
export type VerticalId = 'atm';
