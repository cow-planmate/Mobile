import React, { createContext } from 'react';
import { View } from 'react-native';
import type { PlaceDetailTarget } from '../PlaceDetailSheet';

export const EditorStateContext = createContext<{
  timelineScrollRef: any;
  selectedDay: any;
  handleDeletePlace: any;
  handleEditTime: any;
  handleUpdatePlaceTimes: any;
  onOpenDetail: any;
  /** 블록의 ⓘ. 시간표는 화면 깊숙이 있어 맥락으로 내려보낸다. */
  onShowPlaceDetail?: (target: PlaceDetailTarget) => void;
  weatherMap: any;
  handleAddPlace: any;
  planId: any;
  destination: any;
  travelId?: any;
  onUndo: any;
  onRedo?: () => void;
  pendingPlace: any;
  previewStartTime: any;
  previewEndTime: any;
  setPreviewStartTime: any;
  setPreviewEndTime: any;
  onConfirmPlacement: any;
  onCancelPreview: any;
  isDragging: boolean;
  dropBlocked: boolean;
  gridRef: React.RefObject<View | null>;
  onTimelineScrollY: (offsetY: number) => void;
  requestAutoScroll: (pointY: number) => number;
  getTimelineScrollY: () => number;
  sheetInset: number;
  onItemDragStart?: () => void;
  onItemDragEnd?: () => void;
} | null>(null);
