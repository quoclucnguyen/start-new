import * as React from 'react';
import { Tag } from 'antd-mobile';
import { VENUE_STATUS_LABELS } from '@/pages/diary/api/types';
import type { VenueStatus } from '@/pages/diary/api/types';

interface VenueStatusBadgeProps {
  status: VenueStatus;
}

const configMap: Record<VenueStatus, { color: string; icon: string }> = {
  favorite: { color: '#f59e0b', icon: '⭐' },
  blacklisted: { color: '#ef4444', icon: '🚫' },
  neutral: { color: '#6b7280', icon: '' },
};

export const VenueStatusBadge: React.FC<VenueStatusBadgeProps> = ({ status }) => {
  if (status === 'neutral') return null;
  const config = configMap[status];
  return (
    <Tag color={config.color} fill="outline" style={{ '--border-radius': '6px' }}>
      {config.icon} {VENUE_STATUS_LABELS[status]}
    </Tag>
  );
};
