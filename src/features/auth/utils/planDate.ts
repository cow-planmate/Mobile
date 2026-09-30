import { parseLocalDate } from '../../../utils/timeUtils';

export const toPlanDate = (value?: string): Date | undefined => {
  if (!value) return undefined;
  const parsed = parseLocalDate(value.replace(/\./g, '-').substring(0, 10));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};
