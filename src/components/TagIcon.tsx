import React, { FC } from 'react';
import { FaTrophy } from 'react-icons/fa';

export type TagType = 'mastered' | 'completed' | 'in_progress' | 'backlog' | 'dropped' | null;

interface TagIconProps {
  type: TagType;
  size?: number;
  className?: string;
}

// Tag colors matching the existing theme
export const TAG_ICON_COLORS = {
  mastered: '#f5576c',
  completed: '#38ef7d',
  in_progress: '#764ba2',
  backlog: '#888',
  dropped: '#c9a171',  // Beige/tan color for dropped games
};

// Note: TrophyIcon removed - now using FaTrophy from react-icons

/**
 * Checkmark in circle for Completed (beat main story)
 */
const CheckCircleIcon: FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
    <path
      d="M8 12l3 3 5-6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

/**
 * Clock/hourglass icon for In Progress
 */
const ClockIcon: FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
    <path
      d="M12 6v6l4 2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

/**
 * Empty circle for Backlog (not started)
 */
const EmptyCircleIcon: FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
  </svg>
);

/**
 * X in circle for Dropped (abandoned)
 */
const XCircleIcon: FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
    <path
      d="M15 9l-6 6M9 9l6 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

/**
 * TagIcon component - displays appropriate icon based on tag type
 */
export const TagIcon: FC<TagIconProps> = ({ type, size = 24, className }) => {
  if (!type) return null;

  const color = TAG_ICON_COLORS[type] || TAG_ICON_COLORS.backlog;

  const iconStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  return (
    <span style={iconStyle} className={className}>
      {type === 'mastered' && <FaTrophy size={size} color={color} />}
      {type === 'completed' && <CheckCircleIcon size={size} color={color} />}
      {type === 'in_progress' && <ClockIcon size={size} color={color} />}
      {type === 'backlog' && <EmptyCircleIcon size={size} color={color} />}
      {type === 'dropped' && <XCircleIcon size={size} color={color} />}
    </span>
  );
};

export default TagIcon;
