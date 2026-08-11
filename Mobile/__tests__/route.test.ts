import axios from 'axios';
import {
  fetchDirections,
  fetchRouteTable,
  fetchRouteTrip,
  fetchTransit,
} from '../src/api/route';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('route API requests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.post.mockResolvedValue({ data: {} });
  });

  it('forwards placeId for route endpoints that accept waypoints', async () => {
    const waypoints = [
      { lat: 37.5665, lng: 126.978, placeId: 'ChIJzWXFYYuifDUR64Pq5LTtioU' },
      { lat: 37.5704, lng: 126.9922, placeId: 'ChIJ9_M3YwCifDUR3aMZon74LJ8' },
    ];

    await fetchDirections(waypoints);
    await fetchRouteTable(waypoints, 'foot');
    await fetchRouteTrip(waypoints, 'driving', true);

    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('/api/route/directions'),
      { waypoints },
    );
    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/api/route/table'),
      { waypoints, profile: 'foot' },
    );
    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('/api/route/trip'),
      { waypoints, profile: 'driving', roundtrip: true },
    );
  });

  it('forwards placeId for transit endpoints', async () => {
    const from = { lat: 37.5665, lng: 126.978, placeId: 'place-a' };
    const to = { lat: 37.5704, lng: 126.9922, placeId: 'place-b' };

    await fetchTransit(from, to);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/route/transit'),
      { from, to },
    );
  });
});
