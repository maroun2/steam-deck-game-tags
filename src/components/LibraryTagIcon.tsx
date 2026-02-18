/**
 * LibraryTagIcon Component
 * Small overlay icon for library grid view
 * Shows simplified tag indicator on game covers
 */

import React, { FC, useEffect, useState } from 'react';
import { call } from '@decky/api';
import { TagIcon, TagType, TAG_ICON_COLORS } from './TagIcon';

// Debug logging helper
const log = (msg: string, data?: any) => {
  const logMsg = `[GameProgressTracker][LibraryTagIcon] ${msg}`;
  if (data !== undefined) {
    console.log(logMsg, data);
  } else {
    console.log(logMsg);
  }
};

interface LibraryTagIconProps {
  appId: string;
}

/**
 * LibraryTagIcon - Minimal icon overlay for library grid
 * Designed to be small and unobtrusive on game covers
 */
export const LibraryTagIcon: FC<LibraryTagIconProps> = ({ appId }) => {
  const [tag, setTag] = useState<{ tag: string; is_manual: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use cached tag if available, otherwise fetch
    const fetchTag = async () => {
      try {
        // Check if we have a cached tag first
        const cachedTag = (window as any).__gameProgressTrackerCache?.tags?.[appId];
        if (cachedTag) {
          setTag(cachedTag);
          setLoading(false);
          return;
        }

        // Fetch from backend if not cached
        const result = await call<[{ appid: string }], { success: boolean; tag: { tag: string; is_manual: boolean } | null }>(
          'get_game_tag',
          { appid: appId }
        );

        if (result.success && result.tag) {
          setTag(result.tag);
          // Cache for future use
          if (!(window as any).__gameProgressTrackerCache) {
            (window as any).__gameProgressTrackerCache = { tags: {} };
          }
          (window as any).__gameProgressTrackerCache.tags[appId] = result.tag;
        }
      } catch (err) {
        log(`Error fetching tag for ${appId}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchTag();
  }, [appId]);

  // Don't render anything if no tag or still loading
  if (loading || !tag?.tag) {
    return null;
  }

  // Container style - positioned absolute over the game cover
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '28px',
    height: '28px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${TAG_ICON_COLORS[tag.tag as keyof typeof TAG_ICON_COLORS] || '#666'}`,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
    zIndex: 10,
    pointerEvents: 'none', // Don't interfere with clicking the game
  };

  return (
    <div style={containerStyle} data-appid={appId} data-tag={tag.tag}>
      <TagIcon type={tag.tag as TagType} size={16} />
    </div>
  );
};

/**
 * Preload all tags for better performance
 * Call this once when the library loads
 */
export async function preloadAllTags(): Promise<void> {
  try {
    log('Preloading all tags for library...');
    const result = await call<[], { success: boolean; games: Array<{ appid: string; tag: string; is_manual: boolean }> }>(
      'get_all_tags_with_names'
    );

    if (result.success && result.games) {
      // Initialize cache
      if (!(window as any).__gameProgressTrackerCache) {
        (window as any).__gameProgressTrackerCache = { tags: {} };
      }

      // Store all tags
      const cache = (window as any).__gameProgressTrackerCache.tags;
      result.games.forEach(game => {
        cache[game.appid] = { tag: game.tag, is_manual: game.is_manual };
      });

      log(`Preloaded ${result.games.length} tags`);
    }
  } catch (err) {
    log('Error preloading tags:', err);
  }
}

export default LibraryTagIcon;