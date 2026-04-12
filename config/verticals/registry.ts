import { VerticalRegistry } from '../types';
import { atmVertical } from './atm.vertical';

export const verticalRegistry: VerticalRegistry = {
  atm: atmVertical,
};

export const defaultVertical = 'atm';
export type VerticalId = keyof typeof verticalRegistry;
