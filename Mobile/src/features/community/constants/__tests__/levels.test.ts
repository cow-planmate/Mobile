import { getActivityScore, getLevelProgress } from '../levels';

describe('community level progress', () => {
  it('calculates the activity score from posts and comments', () => {
    expect(getActivityScore(3, 2)).toBe(11);
  });

  it('returns progress toward the next level', () => {
    expect(getLevelProgress(3, 2)).toMatchObject({
      score: 11,
      currentTier: { level: 2, min: 10 },
      nextTier: { level: 3, min: 30 },
      progressPercent: 5,
    });
  });

  it('caps progress at the final level', () => {
    expect(getLevelProgress(50, 0)).toMatchObject({
      score: 150,
      currentTier: { level: 5, min: 150 },
      nextTier: null,
      progressPercent: 100,
    });
  });
});
