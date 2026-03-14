import * as React from 'react';
import { Tag } from 'antd-mobile';
import { MEAL_TYPE_LABELS, MEAL_TYPE_ICONS } from '@/api/diary/types';
import type { MealType } from '@/api/diary/types';

interface MealTypeBadgeProps {
  type: MealType;
}

const colorMap: Record<MealType, string> = {
  delivery: '#3b82f6',
  dine_in: '#f59e0b',
  ready_made: '#8b5cf6',
};

export const MealTypeBadge: React.FC<MealTypeBadgeProps> = ({ type }) => {
  return (
    <Tag color={colorMap[type]} fill="outline" style={{ '--border-radius': '6px' }}>
      {MEAL_TYPE_ICONS[type]} {MEAL_TYPE_LABELS[type]}
    </Tag>
  );
};
