import * as auth from '../src/features/auth';
import * as itinerary from '../src/features/itinerary';
import * as community from '../src/features/community';
import * as places from '../src/features/places';

describe('Features Scaffolding Exports', () => {
  it('should export features modules successfully', () => {
    expect(auth).toBeDefined();
    expect(itinerary).toBeDefined();
    expect(community).toBeDefined();
    expect(places).toBeDefined();
  });
});
