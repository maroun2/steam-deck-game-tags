/**
 * React hook for managing game tags
 */

import { useState, useEffect } from 'react';
import { call } from '@decky/api';
import { GameTag } from '../types';

// Debug logging helper
const log = (msg: string, data?: any) => {
  const logMsg = `[GameProgressTracker][useGameTag] ${msg}`;
  if (data !== undefined) {
    console.log(logMsg, data);
  } else {
    console.log(logMsg);
  }
};

export function useGameTag(appid: string) {
  const [tag, setTag] = useState<GameTag | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    log(`useEffect triggered for appid=${appid}`);
    fetchTag();
  }, [appid]);

  const fetchTag = async () => {
    try {
      log(`fetchTag: calling get_game_tag for appid=${appid}`);
      setLoading(true);
      setError(null);

      const result = await call<[{ appid: string }], { success: boolean; tag: GameTag | null }>('get_game_tag', { appid });
      log(`fetchTag: result for appid=${appid}:`, result);
      setTag(result.tag);
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to fetch tag';
      setError(errorMsg);
      log(`fetchTag: error for appid=${appid}: ${errorMsg}`, err);
    } finally {
      setLoading(false);
    }
  };

  const setManualTag = async (newTag: string) => {
    try {
      setError(null);

      const result = await call<[{ appid: string; tag: string }], { success: boolean; error?: string }>('set_manual_tag', { appid, tag: newTag });

      if (result.success) {
        await fetchTag();
      } else {
        setError(result.error || 'Failed to set tag');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to set tag');
      console.error('Error setting tag:', err);
    }
  };

  const removeTag = async () => {
    try {
      setError(null);

      const result = await call<[{ appid: string }], { success: boolean; error?: string }>('remove_tag', { appid });

      if (result.success) {
        await fetchTag();
      } else {
        setError(result.error || 'Failed to remove tag');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to remove tag');
      console.error('Error removing tag:', err);
    }
  };

  const resetToAuto = async () => {
    try {
      setError(null);

      const result = await call<[{ appid: string }], { success: boolean; error?: string }>('reset_to_auto_tag', { appid });

      if (result.success) {
        await fetchTag();
      } else {
        setError(result.error || 'Failed to reset tag');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to reset tag');
      console.error('Error resetting tag:', err);
    }
  };

  return {
    tag,
    loading,
    error,
    refetch: fetchTag,
    setManualTag,
    removeTag,
    resetToAuto
  };
}
