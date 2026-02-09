/**
 * Settings Component
 * Plugin settings and configuration panel
 */

import React, { VFC, useState, useEffect } from 'react';
import { ServerAPI, PluginSettings, SyncResult, TagStatistics } from '../types';

interface SettingsProps {
  serverAPI: ServerAPI;
}

export const Settings: VFC<SettingsProps> = ({ serverAPI }) => {
  const [settings, setSettings] = useState<PluginSettings>({
    auto_tag_enabled: true,
    mastered_multiplier: 1.5,
    in_progress_threshold: 60,
    cache_ttl: 7200
  });
  const [stats, setStats] = useState<TagStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await serverAPI.callPluginMethod<{ settings: PluginSettings }>('get_settings', {});
      if (response.result.settings) {
        setSettings(response.result.settings);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const loadStats = async () => {
    try {
      const response = await serverAPI.callPluginMethod<{ stats: TagStatistics }>('get_tag_statistics', {});
      if (response.result.stats) {
        setStats(response.result.stats);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const updateSetting = async (key: keyof PluginSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      await serverAPI.callPluginMethod('update_settings', {
        settings: newSettings
      });
      showMessage('Settings saved');
    } catch (err) {
      console.error('Error updating settings:', err);
      showMessage('Failed to save settings');
    }
  };

  const syncLibrary = async () => {
    try {
      setSyncing(true);
      setMessage('Syncing library... This may take several minutes.');

      const response = await serverAPI.callPluginMethod<SyncResult>('sync_library', {});
      const result = response.result;

      if (result.success) {
        showMessage(
          `Sync complete! ${result.synced}/${result.total} games synced. ` +
          (result.errors ? `${result.errors} errors.` : '')
        );
        await loadStats();
      } else {
        showMessage(`Sync failed: ${result.error}`);
      }
    } catch (err: any) {
      console.error('Error syncing library:', err);
      showMessage(`Sync error: ${err?.message || 'Unknown error'}`);
    } finally {
      setSyncing(false);
    }
  };

  const refreshCache = async () => {
    try {
      setLoading(true);
      await serverAPI.callPluginMethod('refresh_hltb_cache', {});
      showMessage('Cache will be refreshed on next sync');
    } catch (err) {
      console.error('Error refreshing cache:', err);
      showMessage('Failed to refresh cache');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Game Progress Tracker</h2>

      {message && (
        <div style={styles.message}>{message}</div>
      )}

      {/* Statistics */}
      {stats && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Library Statistics</h3>
          <div style={styles.statGrid}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.completed}</div>
              <div style={styles.statLabel}>Completed</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.in_progress}</div>
              <div style={styles.statLabel}>In Progress</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.mastered}</div>
              <div style={styles.statLabel}>Mastered</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.total}</div>
              <div style={styles.statLabel}>Total Tagged</div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-tagging Settings */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Automatic Tagging</h3>

        <div style={styles.settingRow}>
          <label style={styles.label}>
            <input
              type="checkbox"
              checked={settings.auto_tag_enabled}
              onChange={(e) => updateSetting('auto_tag_enabled', e.target.checked)}
              style={styles.checkbox}
            />
            Enable Auto-Tagging
          </label>
        </div>
      </div>

      {/* Tag Thresholds */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Tag Thresholds</h3>

        <div style={styles.settingRow}>
          <label style={styles.label}>
            Mastered Multiplier: {settings.mastered_multiplier}x
          </label>
          <input
            type="range"
            min="1.0"
            max="3.0"
            step="0.1"
            value={settings.mastered_multiplier}
            onChange={(e) => updateSetting('mastered_multiplier', parseFloat(e.target.value))}
            style={styles.slider}
          />
          <div style={styles.hint}>
            Playtime must be this many times the HLTB completion time
          </div>
        </div>

        <div style={styles.settingRow}>
          <label style={styles.label}>
            In Progress Threshold: {settings.in_progress_threshold} minutes
          </label>
          <input
            type="range"
            min="15"
            max="300"
            step="15"
            value={settings.in_progress_threshold}
            onChange={(e) => updateSetting('in_progress_threshold', parseInt(e.target.value))}
            style={styles.slider}
          />
          <div style={styles.hint}>
            Minimum playtime to mark as In Progress
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Data Management</h3>

        <button
          onClick={syncLibrary}
          disabled={syncing || loading}
          style={syncing ? styles.buttonDisabled : styles.button}
        >
          {syncing ? 'Syncing...' : 'Sync Entire Library'}
        </button>

        <button
          onClick={refreshCache}
          disabled={syncing || loading}
          style={styles.buttonSecondary}
        >
          Refresh HLTB Cache
        </button>

        <div style={styles.hint}>
          Sync may take several minutes for large libraries
        </div>
      </div>

      {/* About */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>About</h3>
        <div style={styles.about}>
          <p>Game Progress Tracker v{__PLUGIN_VERSION__}</p>
          <p>Automatic game tagging based on achievements, playtime, and completion time.</p>
          <p style={styles.smallText}>
            Data from HowLongToBeat • Steam achievement system
          </p>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
    color: 'white',
  },
  title: {
    margin: '0 0 20px 0',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  message: {
    padding: '12px',
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    borderRadius: '4px',
    marginBottom: '16px',
    fontSize: '14px',
    border: '1px solid rgba(102, 126, 234, 0.5)',
  },
  section: {
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #333',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#aaa',
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
  },
  statCard: {
    backgroundColor: '#252525',
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#aaa',
  },
  settingRow: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    marginBottom: '8px',
    cursor: 'pointer',
  },
  checkbox: {
    marginRight: '8px',
    cursor: 'pointer',
  },
  slider: {
    width: '100%',
    marginTop: '8px',
  },
  hint: {
    fontSize: '12px',
    color: '#888',
    marginTop: '4px',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#667eea',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '8px',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#555',
    border: 'none',
    borderRadius: '4px',
    color: '#aaa',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'not-allowed',
    marginBottom: '8px',
  },
  buttonSecondary: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#444',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    fontSize: '13px',
    cursor: 'pointer',
    marginBottom: '8px',
  },
  about: {
    fontSize: '14px',
    lineHeight: '1.6',
  },
  smallText: {
    fontSize: '12px',
    color: '#888',
    marginTop: '8px',
  },
};
