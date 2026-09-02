import React from 'react';
import renderer, { act } from 'react-test-renderer';
import PlanScheduleList, { formatFullDate } from '../PlanScheduleList';
import { Place } from '../TimelineItem';

const place = (over: Partial<Place> = {}): Place => ({
  id: over.id ?? '1',
  name: over.name ?? '석봉도자기미술관',
  type: over.type ?? '관광지',
  startTime: over.startTime ?? '09:00',
  endTime: over.endTime ?? '10:00',
  address: over.address ?? '강원특별자치도 속초시 엑스포로 156',
  imageUrl: over.imageUrl ?? '',
  latitude: 38.19,
  longitude: 128.58,
  ...over,
});

const collect = (node: any, out: string[]) => {
  if (typeof node === 'string') {
    out.push(node);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach(child => collect(child, out));
    return;
  }
  if (node?.children) collect(node.children, out);
};

const textOf = (element: React.ReactElement) => {
  let tree: renderer.ReactTestRenderer | undefined;
  act(() => {
    tree = renderer.create(element);
  });
  const out: string[] = [];
  collect(tree!.toJSON(), out);
  return out.join('').replace(/\s+/g, ' ').trim();
};

describe('formatFullDate', () => {
  it('연월일과 요일을 함께 적는다', () => {
    expect(formatFullDate(new Date(2026, 8, 5))).toBe('2026년 9월 5일 (토)');
  });

  it('날짜가 없으면 빈 문자열이다', () => {
    expect(formatFullDate(null)).toBe('');
    expect(formatFullDate(new Date('무효'))).toBe('');
  });
});

describe('PlanScheduleList', () => {
  it('시각과 장소를 차례로 보여준다', () => {
    const text = textOf(
      <PlanScheduleList
        places={[
          place({ id: '1', name: '울산바위', startTime: '09:00', endTime: '10:30' }),
          place({ id: '2', name: '속초등대', startTime: '11:00', endTime: '12:00' }),
        ]}
      />,
    );
    expect(text).toContain('09:00');
    expect(text).toContain('~10:30');
    expect(text).toContain('울산바위');
    expect(text).toContain('속초등대');
  });

  it('장소 수를 헤아려 적는다', () => {
    expect(
      textOf(<PlanScheduleList places={[place({ id: '1' }), place({ id: '2' })]} />),
    ).toContain('2곳');
  });

  it('날짜를 받으면 제목 아래 적는다', () => {
    expect(
      textOf(<PlanScheduleList places={[place()]} dateLabel="2026년 9월 5일 (토)" />),
    ).toContain('2026년 9월 5일 (토)');
  });

  it('메모가 있으면 함께 보여준다', () => {
    expect(
      textOf(<PlanScheduleList places={[place({ memo: '  표 예매함  ' })]} />),
    ).toContain('표 예매함');
  });

  it('갈래 이름을 장소 위에 적는다', () => {
    const text = textOf(
      <PlanScheduleList places={[place({ type: '숙소', categoryId: 1 })]} />,
    );
    expect(text).toContain('숙소');
  });

  it('일정이 없는 날은 안내만 남긴다', () => {
    const text = textOf(<PlanScheduleList places={[]} />);
    expect(text).toContain('이 날에는 아직 일정이 없어요');
    expect(text).not.toContain('곳');
  });
});
