import { buildFeedUpdatePayload, parseFeedTags } from '../feedPostPayload';

describe('feedPostPayload', () => {
  it('normalizes and deduplicates feed tags', () => {
    expect(parseFeedTags('seoul, #food, seoul, , beach')).toEqual([
      '#seoul',
      '#food',
      '#beach',
    ]);
  });

  it('builds an update payload without itinerary fields', () => {
    const payload = buildFeedUpdatePayload({
      title: ' Updated title ',
      content: ' Updated content ',
      tags: 'travel, #food',
      thumbnailUrl: ' ',
    });

    expect(payload).toMatchObject({
      title: 'Updated title',
      contentText: 'Updated content',
      thumbnailUrl: null,
      tags: ['#travel', '#food'],
    });
    expect(payload).not.toHaveProperty('itinerary');
    expect(payload).not.toHaveProperty('sourcePlanId');
    expect(payload).not.toHaveProperty('durationDays');
  });
});
