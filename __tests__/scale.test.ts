import { getScaleForWidth } from '../src/utils/normalize';

describe('scale utility', () => {
  it('clamps compact screens to the minimum scale', () => {
    expect(getScaleForWidth(320)).toBe(0.95);
  });

  it('keeps the 360dp baseline unchanged', () => {
    expect(getScaleForWidth(360)).toBe(1);
  });

  it('clamps unfolded screens to the maximum scale', () => {
    expect(getScaleForWidth(673)).toBe(1.2);
  });
});
