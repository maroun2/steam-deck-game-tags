/**
 * React hook for managing game tags
 */

import { useState, useEffect } from 'react';
import { ServerAPI, GameTag } from '../types';

export function useGameTag(serverAPI: ServerAPI, appid: string) {
  const [tag, setTag] = useState<GameTag | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTag();
  }, [appid]);

  const fetchTag = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await serverAPI.callPluginMethod<{ tag: GameTag }>('get_game_tag', {
        appid: appid
      });

      setTag(response.result.tag);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch tag');
      console.error('Error fetching tag:', err);
    } finally {
      setLoading(false);
    }
  };

  const setManualTag = async (newTag: string) => {
    try {
      setError(null);

      const response = await serverAPI.callPluginMethod('set_manual_tag', {
        appid: appid,
        tag: newTag
      });

      if (response.result.success) {
        await fetchTag();
      } else {
        setError(response.result.error || 'Failed to set tag');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to set tag');
      console.error('Error setting tag:', err);
    }
  };

  const removeTag = async () => {
    try {
      setError(null);

      const response = await serverAPI.callPluginMethod('remove_tag', {
        appid: appid
      });

      if (response.result.success) {
        await fetchTag();
      } else {
        setError(response.result.error || 'Failed to remove tag');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to remove tag');
      console.error('Error removing tag:', err);
    }
  };

  const resetToAuto = async () => {
    try {
      setError(null);

      const response = await serverAPI.callPluginMethod('reset_to_auto_tag', {
        appid: appid
      });

      if (response.result.success) {
        await fetchTag();
      } else {
        setError(response.result.error || 'Failed to reset tag');
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
