export type Place = {
  id: string;
  name: string;
  type: '관광지' | '숙소' | '식당' | '기타';
  startTime: string;
  endTime: string;
  address: string;
  rating: number;
  imageUrl: string;
  latitude: number;
  longitude: number;
};

export interface Day {
  date: Date;
  dayNumber: number;
  places: Place[];
}
