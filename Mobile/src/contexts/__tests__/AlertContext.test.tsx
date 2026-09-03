import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { AlertProvider, useAlert } from '../AlertContext';

const BLUE = '#1344FF';
const RED = '#FF3B30';
const ORANGE = '#FF9500';

/** showAlert를 밖에서 부를 수 있게 통로만 내주는 껍데기. */
let fire: ((opts: any) => void) | null = null;
const Probe = () => {
  const { showAlert } = useAlert();
  fire = showAlert;
  return null;
};

const open = (opts: any) => {
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <AlertProvider>
        <Probe />
      </AlertProvider>,
    );
  });
  act(() => {
    fire!(opts);
  });
  return tree!;
};

/** 단추만 골라 채움·테두리·글자색을 뽑는다. */
const buttonsOf = (tree: renderer.ReactTestRenderer) =>
  tree.root
    .findAll(
      n =>
        typeof n.props?.testID === 'string' &&
        n.props.testID.startsWith('alert-button-'),
    )
    // findAll은 껍데기와 실제 요소를 둘 다 집어 온다. testID로 하나만 남긴다.
    .filter(
      (n, i, all) =>
        all.findIndex(m => m.props.testID === n.props.testID) === i,
    )
    .map(node => {
      const flat = ([] as any[])
        .concat(
          typeof node.props.style === 'function'
            ? node.props.style({ pressed: false })
            : node.props.style,
        )
        .flat()
        .filter(Boolean);
      const texts = node.findAllByType(Text);
      return {
        label: texts.map(t => t.props.children).join(''),
        background: flat.reduce(
          (acc: string | undefined, x: any) => x?.backgroundColor ?? acc,
          undefined,
        ),
        border: flat.reduce(
          (acc: string | undefined, x: any) => x?.borderColor ?? acc,
          undefined,
        ),
        color: ([] as any[])
          .concat(texts[0]?.props.style)
          .flat()
          .filter(Boolean)
          .reduce((acc: string | undefined, x: any) => x?.color ?? acc, undefined),
      };
    });

const textOf = (tree: renderer.ReactTestRenderer) =>
  tree.root
    .findAllByType(Text)
    .map(t => t.props.children)
    .filter(c => typeof c === 'string')
    .join(' ');

afterEach(() => {
  fire = null;
});

describe('대화상자', () => {
  it('제목과 본문을 그대로 보여준다', () => {
    const tree = open({
      title: '장소를 삭제할까요?',
      message: '메모와 시간도 사라져요.',
    });
    expect(textOf(tree)).toContain('장소를 삭제할까요?');
    expect(textOf(tree)).toContain('메모와 시간도 사라져요.');
  });

  it('단추를 안 주면 확인 하나만 채워서 낸다', () => {
    const tree = open({ title: '저장하지 못했어요' });
    const btns = buttonsOf(tree);
    expect(btns).toHaveLength(1);
    expect(btns[0].label).toBe('확인');
    expect(btns[0].background).toBe(BLUE);
  });

  it('지우기가 있으면 물러나는 쪽만 채우고 지우기는 실선으로 둔다', () => {
    const tree = open({
      title: '장소를 삭제할까요?',
      buttons: [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive' },
      ],
    });
    const [cancel, remove] = buttonsOf(tree);
    expect(cancel.label).toBe('취소');
    expect(cancel.background).toBe(BLUE);

    expect(remove.label).toBe('삭제');
    // 채우지 않는다 — 되돌릴 수 없는 쪽이 더 쉬워 보이면 안 된다.
    expect(remove.background).toBeUndefined();
    expect(remove.border).toBe(RED);
    expect(remove.color).toBe(RED);
  });

  it('지우기가 없으면 밀고 나가는 쪽을 채우고 취소는 조용히 둔다', () => {
    const tree = open({
      title: '수락하지 못했어요',
      buttons: [
        { text: '닫기', style: 'cancel' },
        { text: '다시 시도' },
      ],
    });
    const [close, retry] = buttonsOf(tree);
    expect(close.label).toBe('닫기');
    expect(close.background).toBeUndefined();
    expect(retry.label).toBe('다시 시도');
    expect(retry.background).toBe(BLUE);
  });

  it('지우기가 달리면 종류를 주의로 잡는다', () => {
    const tree = open({
      title: '장소를 삭제할까요?',
      type: 'confirm',
      buttons: [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive' },
      ],
    });
    // 표식은 단추가 아닌 곳에 있는 유일한 색 요소다.
    const marks = tree.root
      .findAll(n => typeof n.props?.color === 'string' && !!n.props?.size)
      .map(n => n.props.color);
    expect(marks).toContain(ORANGE);
  });

  it('제목만으로 종류를 짐작할 때도 오류는 오류로 잡는다', () => {
    const tree = open({ title: '오류', message: '저장하지 못했어요.' });
    const marks = tree.root
      .findAll(n => typeof n.props?.color === 'string' && !!n.props?.size)
      .map(n => n.props.color);
    expect(marks).toContain(RED);
  });
});
