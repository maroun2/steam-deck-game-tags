/**
 * TagManager Component
 * Modal for managing game tags manually
 */

import React, { FC, useState, useEffect } from 'react';
import { call } from '@decky/api';
import { GameDetails } from '../types';
import { TagIcon, TAG_ICON_COLORS } from './TagIcon';

// Debug logging helper
const log = (msg: string, data?: any) => {
  const logMsg = `[GameProgressTracker][TagManager] ${msg}`;
  if (data !== undefined) {
    console.log(logMsg, data);
  } else {
    console.log(logMsg);
  }
};

interface TagManagerProps {
  appid: string;
  onClose: () => void;
}

export const TagManager: FC<TagManagerProps> = ({ appid, onClose }) => {
  const [details, setDetails] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  log(`TagManager mounted for appid=${appid}`);

  useEffect(() => {
    log(`TagManager useEffect: fetching details for appid=${appid}`);
    fetchDetails();
  }, [appid]);

  const fetchDetails = async () => {
    try {
      log(`fetchDetails: calling get_game_details for appid=${appid}`);
      setLoading(true);
      setError(null);

      const result = await call<[{ appid: string }], GameDetails>('get_game_details', { appid });
      log(`fetchDetails: result for appid=${appid}:`, result);
      setDetails(result);
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to load game details';
      setError(errorMsg);
      log(`fetchDetails: error for appid=${appid}: ${errorMsg}`, err);
    } finally {
      setLoading(false);
    }
  };

  const setTag = async (tag: string) => {
    try {
      log(`setTag: calling set_manual_tag for appid=${appid}, tag=${tag}`);
      const result = await call<[{ appid: string; tag: string }], { success: boolean; error?: string }>('set_manual_tag', { appid, tag });
      log(`setTag: result for appid=${appid}:`, result);
      await fetchDetails();
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to set tag';
      setError(errorMsg);
      log(`setTag: error for appid=${appid}: ${errorMsg}`, err);
    }
  };

  const resetToAuto = async () => {
    try {
      log(`resetToAuto: calling reset_to_auto_tag for appid=${appid}`);
      const result = await call<[{ appid: string }], { success: boolean; error?: string }>('reset_to_auto_tag', { appid });
      log(`resetToAuto: result for appid=${appid}:`, result);
      await fetchDetails();
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to reset tag';
      setError(errorMsg);
      log(`resetToAuto: error for appid=${appid}: ${errorMsg}`, err);
    }
  };

  const removeTag = async () => {
    try {
      log(`removeTag: calling remove_tag for appid=${appid}`);
      const result = await call<[{ appid: string }], { success: boolean; error?: string }>('remove_tag', { appid });
      log(`removeTag: result for appid=${appid}:`, result);
      await fetchDetails();
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to remove tag';
      setError(errorMsg);
      log(`removeTag: error for appid=${appid}: ${errorMsg}`, err);
    }
  };

  if (loading) {
    return (
      <div style={styles.modal}>
        <div style={styles.content}>
          <div style={styles.loading}>Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !details || !details.success) {
    return (
      <div style={styles.modal}>
        <div style={styles.content}>
          <div style={styles.error}>{error || 'Failed to load game details'}</div>
          <button onClick={onClose} style={styles.button}>Close</button>
        </div>
      </div>
    );
  }

  const stats = details.stats;
  const tag = details.tag;
  const hltb = details.hltb_data;

  return (
    <div style={styles.modal} onClick={onClose}>
      <div style={styles.content} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>Manage Tags: {stats?.game_name || `Game ${appid}`}</h2>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Game Statistics</h3>
          {stats && (
            <>
              <div style={styles.statRow}>
                <span>Playtime:</span>
                <span>{Math.floor(stats.playtime_minutes / 60)}h {stats.playtime_minutes % 60}m</span>
              </div>
              <div style={styles.statRow}>
                <span>Achievements:</span>
                <span>{stats.unlocked_achievements}/{stats.total_achievements}</span>
              </div>
            </>
          )}
          {hltb && (
            <>
              <div style={styles.statRow}>
                <span>HLTB Match:</span>
                <span>{hltb.matched_name} ({(hltb.similarity * 100).toFixed(0)}%)</span>
              </div>
              {hltb.main_extra && (
                <div style={styles.statRow}>
                  <span>Main+Extra:</span>
                  <span>{hltb.main_extra}h</span>
                </div>
              )}
            </>
          )}
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Current Tag</h3>
          <div style={styles.currentTag}>
            {tag?.tag ? (
              <>
                <TagIcon type={tag.tag as any} size={24} />
                <span style={{ color: TAG_ICON_COLORS[tag.tag as keyof typeof TAG_ICON_COLORS] }}>
                  {tag.tag.replace('_', ' ').toUpperCase()}
                </span>
                <span style={styles.tagType}>
                  {tag.is_manual ? '(Manual)' : '(Automatic)'}
                </span>
              </>
            ) : (
              <span style={styles.noTag}>No tag assigned</span>
            )}
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Set Tag</h3>
          <div style={styles.tagButtonGroup}>
            <button
              onClick={() => setTag('mastered')}
              style={{ ...styles.tagButton, backgroundColor: TAG_ICON_COLORS.mastered }}
            >
              <TagIcon type="mastered" size={20} />
              <span>Mastered</span>
            </button>
            <button
              onClick={() => setTag('completed')}
              style={{ ...styles.tagButton, backgroundColor: TAG_ICON_COLORS.completed }}
            >
              <TagIcon type="completed" size={20} />
              <span>Completed</span>
            </button>
            <button
              onClick={() => setTag('in_progress')}
              style={{ ...styles.tagButton, backgroundColor: TAG_ICON_COLORS.in_progress }}
            >
              <TagIcon type="in_progress" size={20} />
              <span>In Progress</span>
            </button>
          </div>
          <div style={styles.buttonGroup}>
            <button onClick={resetToAuto} style={styles.secondaryButton}>
              Reset to Automatic
            </button>
            <button onClick={removeTag} style={styles.secondaryButton}>
              Remove Tag
            </button>
          </div>
        </div>

        <button onClick={onClose} style={styles.closeButton}>Close</button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  content: {
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    color: 'white',
  },
  title: {
    margin: '0 0 20px 0',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: '20px',
    paddingBottom: '20px',
    borderBottom: '1px solid #333',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#aaa',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    fontSize: '14px',
  },
  currentTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#252525',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  tagType: {
    fontSize: '12px',
    color: '#888',
    fontWeight: 'normal',
  },
  noTag: {
    color: '#888',
    fontStyle: 'italic',
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
    flexWrap: 'wrap',
  },
  tagButtonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '12px',
  },
  tagButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  secondaryButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#444',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  closeButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#555',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '8px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
  },
  error: {
    textAlign: 'center',
    padding: '20px',
    fontSize: '14px',
    color: '#ff6b6b',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#667eea',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '12px',
  },
};
