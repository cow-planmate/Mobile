import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  PanResponder,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import GripVertical from 'lucide-react-native/dist/esm/icons/grip-vertical';
import { ChecklistItem } from '../../../../api/checklist';
import { normalize } from '../../../../utils/normalize';
import { COLORS, styles } from './ChecklistSheet.styles';

interface Props {
  items: ChecklistItem[];
  disabled: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onReorder: (ids: number[]) => void;
  renderItem: (
    item: ChecklistItem,
    handle: React.ReactNode,
    active: boolean,
  ) => React.ReactNode;
}

interface HandleProps {
  label: string;
  disabled: boolean;
  onStart: (y: number) => void;
  onMove: (dy: number, y: number) => void;
  onEnd: () => void;
  onCancel: () => void;
  onStep: (direction: number) => void;
}

function DragHandle(props: HandleProps) {
  const latest = useRef(props);
  latest.current = props;
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !latest.current.disabled,
        onMoveShouldSetPanResponder: () => !latest.current.disabled,
        onPanResponderGrant: (_, gesture) => latest.current.onStart(gesture.y0),
        onPanResponderMove: (_, gesture) =>
          latest.current.onMove(gesture.dy, gesture.moveY),
        onPanResponderRelease: () => latest.current.onEnd(),
        onPanResponderTerminate: () => latest.current.onCancel(),
        onPanResponderTerminationRequest: () => false,
      }),
    [],
  );

  return (
    <View
      {...responder.panHandlers}
      style={styles.dragHandle}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={`${props.label} 순서 변경`}
      accessibilityHint="손잡이를 끌어 순서를 바꿉니다. 위 또는 아래로 쓸어 한 칸씩 이동할 수도 있습니다."
      accessibilityState={{ disabled: props.disabled }}
      accessibilityActions={[
        { name: 'increment', label: '아래로 이동' },
        { name: 'decrement', label: '위로 이동' },
      ]}
      onAccessibilityAction={event => {
        if (!props.disabled)
          props.onStep(event.nativeEvent.actionName === 'increment' ? 1 : -1);
      }}
    >
      <GripVertical size={normalize(17)} color={COLORS.textSecondary} />
    </View>
  );
}

type RowLayout = { y: number; height: number };
type Drag = {
  id: number;
  from: number;
  to: number;
  offset: number;
  dy: number;
  fingerY: number;
  ids: number[];
  rows: RowLayout[];
};

export default function ChecklistDragList(props: Props) {
  const { items, disabled, refreshing, onRefresh, renderItem } = props;
  const latest = useRef(props);
  latest.current = props;
  const scroll = useRef<ScrollView>(null);
  const viewport = useRef<View>(null);
  const bounds = useRef({ y: 0, height: 0, contentHeight: 0, offset: 0 });
  const layouts = useRef(new Map<number, RowLayout>());
  const drag = useRef<Drag | null>(null);
  const translation = useRef(new Animated.Value(0)).current;
  const [position, setPosition] = useState<{
    id: number;
    from: number;
    to: number;
  } | null>(null);

  const cancel = useCallback(() => {
    drag.current = null;
    translation.setValue(0);
    setPosition(null);
  }, [translation]);

  const move = useCallback(
    (dy: number, y: number) => {
      const current = drag.current;
      if (!current) return;
      current.dy = dy;
      current.fingerY = y;
      const row = current.rows[current.from];
      const delta = Math.max(
        -row.y,
        Math.min(
          bounds.current.contentHeight - row.y - row.height,
          dy + bounds.current.offset - current.offset,
        ),
      );
      translation.setValue(delta);
      const top = row.y + delta;
      let cursor = current.rows[0].y;
      let to = 0;
      current.rows.forEach((other, index) => {
        if (index === current.from) return;
        if (top > cursor + other.height / 2) to++;
        cursor += other.height;
      });
      if (to !== current.to) {
        current.to = to;
        setPosition({ id: current.id, from: current.from, to });
      }
    },
    [translation],
  );

  const activeId = position?.id;
  useEffect(() => {
    if (activeId === undefined) return;
    const timer = setInterval(() => {
      const current = drag.current;
      if (!current) return;
      const view = bounds.current;
      const edge = normalize(44);
      const speed =
        current.fingerY < view.y + edge
          ? -normalize(10)
          : current.fingerY > view.y + view.height - edge
          ? normalize(10)
          : 0;
      const offset = Math.max(
        0,
        Math.min(
          Math.max(0, view.contentHeight - view.height),
          view.offset + speed,
        ),
      );
      if (offset !== view.offset) {
        view.offset = offset;
        scroll.current?.scrollTo({ y: offset, animated: false });
        move(current.dy, current.fingerY);
      }
    }, 32);
    return () => clearInterval(timer);
  }, [activeId, move]);

  useEffect(() => {
    const current = drag.current;
    if (
      current &&
      (disabled ||
        current.ids.join(',') !== items.map(item => item.itemId).join(','))
    )
      cancel();
  }, [disabled, items, cancel]);

  return (
    <View
      ref={viewport}
      collapsable={false}
      style={styles.listScroll}
      onLayout={() => {
        viewport.current?.measureInWindow((_, y, __, height) => {
          bounds.current.y = y;
          bounds.current.height = height;
        });
      }}
    >
      <ScrollView
        ref={scroll}
        style={styles.listScroll}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!position}
        scrollEventThrottle={16}
        onScroll={event => {
          bounds.current.offset = event.nativeEvent.contentOffset.y;
        }}
        onContentSizeChange={(_, height) => {
          bounds.current.contentHeight = height;
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            enabled={!disabled && !position}
            tintColor={COLORS.primary}
          />
        }
      >
        {items.map((item, index) => {
          const active = position?.id === item.itemId;
          const height = drag.current?.rows[position?.from ?? 0]?.height ?? 0;
          const shift =
            position && index > position.from && index <= position.to
              ? -height
              : position && index < position.from && index >= position.to
              ? height
              : 0;
          const handle = (
            <DragHandle
              label={item.content}
              disabled={disabled || items.length < 2}
              onStart={y => {
                const rows = items.map(entry =>
                  layouts.current.get(entry.itemId),
                );
                if (rows.some(row => !row)) return;
                drag.current = {
                  id: item.itemId,
                  from: index,
                  to: index,
                  offset: bounds.current.offset,
                  dy: 0,
                  fingerY: y,
                  ids: items.map(entry => entry.itemId),
                  rows: rows as RowLayout[],
                };
                setPosition({ id: item.itemId, from: index, to: index });
                viewport.current?.measureInWindow((_, top, __, viewHeight) => {
                  bounds.current.y = top;
                  bounds.current.height = viewHeight;
                });
              }}
              onMove={move}
              onCancel={cancel}
              onEnd={() => {
                const current = drag.current;
                cancel();
                if (
                  !current ||
                  current.from === current.to ||
                  latest.current.disabled ||
                  current.ids.join(',') !==
                    latest.current.items.map(entry => entry.itemId).join(',')
                )
                  return;
                const ids = [...current.ids];
                ids.splice(current.to, 0, ids.splice(current.from, 1)[0]);
                latest.current.onReorder(ids);
              }}
              onStep={direction => {
                const next = index + direction;
                if (next < 0 || next >= items.length) return;
                const ids = items.map(entry => entry.itemId);
                ids.splice(next, 0, ids.splice(index, 1)[0]);
                props.onReorder(ids);
              }}
            />
          );
          return (
            <Animated.View
              key={item.itemId}
              onLayout={event =>
                layouts.current.set(item.itemId, event.nativeEvent.layout)
              }
              style={[
                {
                  transform: [{ translateY: active ? translation : shift }],
                },
                active && styles.draggedItem,
              ]}
            >
              {renderItem(item, handle, active)}
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}
