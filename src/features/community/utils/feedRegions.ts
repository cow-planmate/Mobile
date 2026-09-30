import { RegionCount } from '../types';

export interface FeedRegionOption {
  region: string;
  count: number;
}

export function buildFeedRegionOptions(
  regionCounts: RegionCount[] | undefined,
): FeedRegionOption[] {
  const counts = new Map<string, number>();

  (regionCounts ?? []).forEach(({ region, count }) => {
    const normalizedRegion = region?.trim();
    if (!normalizedRegion || count <= 0) return;
    counts.set(normalizedRegion, (counts.get(normalizedRegion) ?? 0) + count);
  });

  return Array.from(counts, ([region, count]) => ({ region, count }));
}
