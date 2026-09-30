import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { PLACE_TABS, type PlaceTab } from '../PlaceRecommendationList';
import {
  styles,
  COLORS,
  TAB_FILL,
} from '../../screens/ItineraryEditorScreen.styles';

/** 시트 손잡이의 갈래 줄. 접힌 채로도 눌러 그 목록을 열 수 있어야 한다. */
const SheetCategoryRow = React.memo(function SheetCategoryRow({
  selected,
  onSelect,
}: {
  selected: PlaceTab;
  onSelect: (tab: PlaceTab) => void;
}) {
  return (
    <View style={styles.sheetCats}>
      {PLACE_TABS.map(tab => {
        const isOn = tab === selected;
        return (
          <TouchableOpacity
            key={tab}
            style={[
              styles.sheetCat,
              isOn && {
                backgroundColor: TAB_FILL[tab] ?? COLORS.primary,
                borderColor: TAB_FILL[tab] ?? COLORS.primary,
              },
            ]}
            onPress={() => onSelect(tab)}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected: isOn }}
          >
            <Text style={[styles.sheetCatText, isOn && styles.sheetCatTextOn]}>
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

export default SheetCategoryRow;
