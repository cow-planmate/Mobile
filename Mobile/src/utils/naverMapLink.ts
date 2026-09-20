const SEARCH_BASE_URL = 'https://map.naver.com/p/search/';

const text = (value?: string | null) => value?.trim() || '';

export const buildNaverMapUrl = ({
  name,
  address,
}: {
  name?: string | null;
  address?: string | null;
}): string | undefined => {
  const normalizedName = text(name);
  if (!normalizedName) return undefined;

  const normalizedAddress = text(address);
  const query = normalizedAddress
    ? `${normalizedName} ${normalizedAddress}`
    : normalizedName;

  return `${SEARCH_BASE_URL}${encodeURIComponent(query)}`;
};
