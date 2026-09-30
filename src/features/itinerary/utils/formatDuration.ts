/** 분 단위 소요 시간을 "1시간 18분" 꿃로 만든다. 값이 없으면 null. */
export const formatMinutes = (minutes?: number | null): string | null => {
  if (minutes == null || Number.isNaN(minutes)) return null;
  const rounded = Math.round(minutes);
  if (rounded >= 60) {
    const hours = Math.floor(rounded / 60);
    const rest = rounded % 60;
    return rest > 0 ? `${hours}시간 ${rest}분` : `${hours}시간`;
  }
  return `${rounded}분`;
};
