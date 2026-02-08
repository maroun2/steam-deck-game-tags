var GameProgressTracker = (function (deckyFrontendLib, React) {
    'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

    /**
     * GameTag Component
     * Displays a colored badge for game tags
     */
    const TAG_STYLES = {
        completed: {
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            label: 'Completed'
        },
        in_progress: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            label: 'In Progress'
        },
        mastered: {
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            label: 'Mastered'
        }
    };
    const GameTag = ({ tag, onClick }) => {
        if (!tag || !tag.tag) {
            return null;
        }
        const style = TAG_STYLES[tag.tag];
        if (!style) {
            return null;
        }
        const containerStyle = {
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: style.background,
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            zIndex: 1000,
            cursor: onClick ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            userSelect: 'none',
            transition: 'transform 0.2s ease',
            ...(onClick ? { transform: 'scale(1)' } : {})
        };
        return (React__default["default"].createElement("div", { onClick: onClick, style: containerStyle, title: tag.is_manual ? 'Manual tag - Click to edit' : 'Automatic tag - Click to edit' },
            React__default["default"].createElement("span", null, style.label),
            tag.is_manual && (React__default["default"].createElement("span", { style: { fontSize: '12px', opacity: 0.8 } }, "\u270E"))));
    };

    /**
     * TagManager Component
     * Modal for managing game tags manually
     */
    const TagManager = ({ serverAPI, appid, onClose }) => {
        const [details, setDetails] = React.useState(null);
        const [loading, setLoading] = React.useState(true);
        const [error, setError] = React.useState(null);
        React.useEffect(() => {
            fetchDetails();
        }, [appid]);
        const fetchDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await serverAPI.callPluginMethod('get_game_details', {
                    appid: appid
                });
                setDetails(response.result);
            }
            catch (err) {
                setError(err?.message || 'Failed to load game details');
                console.error('Error fetching game details:', err);
            }
            finally {
                setLoading(false);
            }
        };
        const setTag = async (tag) => {
            try {
                await serverAPI.callPluginMethod('set_manual_tag', {
                    appid: appid,
                    tag: tag
                });
                await fetchDetails();
            }
            catch (err) {
                setError(err?.message || 'Failed to set tag');
                console.error('Error setting tag:', err);
            }
        };
        const resetToAuto = async () => {
            try {
                await serverAPI.callPluginMethod('reset_to_auto_tag', {
                    appid: appid
                });
                await fetchDetails();
            }
            catch (err) {
                setError(err?.message || 'Failed to reset tag');
                console.error('Error resetting tag:', err);
            }
        };
        const removeTag = async () => {
            try {
                await serverAPI.callPluginMethod('remove_tag', {
                    appid: appid
                });
                await fetchDetails();
            }
            catch (err) {
                setError(err?.message || 'Failed to remove tag');
                console.error('Error removing tag:', err);
            }
        };
        if (loading) {
            return (React__default["default"].createElement("div", { style: styles$1.modal },
                React__default["default"].createElement("div", { style: styles$1.content },
                    React__default["default"].createElement("div", { style: styles$1.loading }, "Loading..."))));
        }
        if (error || !details || !details.success) {
            return (React__default["default"].createElement("div", { style: styles$1.modal },
                React__default["default"].createElement("div", { style: styles$1.content },
                    React__default["default"].createElement("div", { style: styles$1.error }, error || 'Failed to load game details'),
                    React__default["default"].createElement("button", { onClick: onClose, style: styles$1.button }, "Close"))));
        }
        const stats = details.stats;
        const tag = details.tag;
        const hltb = details.hltb_data;
        return (React__default["default"].createElement("div", { style: styles$1.modal, onClick: onClose },
            React__default["default"].createElement("div", { style: styles$1.content, onClick: (e) => e.stopPropagation() },
                React__default["default"].createElement("h2", { style: styles$1.title },
                    "Manage Tags: ",
                    stats?.game_name || `Game ${appid}`),
                React__default["default"].createElement("div", { style: styles$1.section },
                    React__default["default"].createElement("h3", { style: styles$1.sectionTitle }, "Game Statistics"),
                    stats && (React__default["default"].createElement(React__default["default"].Fragment, null,
                        React__default["default"].createElement("div", { style: styles$1.statRow },
                            React__default["default"].createElement("span", null, "Playtime:"),
                            React__default["default"].createElement("span", null,
                                Math.floor(stats.playtime_minutes / 60),
                                "h ",
                                stats.playtime_minutes % 60,
                                "m")),
                        React__default["default"].createElement("div", { style: styles$1.statRow },
                            React__default["default"].createElement("span", null, "Achievements:"),
                            React__default["default"].createElement("span", null,
                                stats.unlocked_achievements,
                                "/",
                                stats.total_achievements)))),
                    hltb && (React__default["default"].createElement(React__default["default"].Fragment, null,
                        React__default["default"].createElement("div", { style: styles$1.statRow },
                            React__default["default"].createElement("span", null, "HLTB Match:"),
                            React__default["default"].createElement("span", null,
                                hltb.matched_name,
                                " (",
                                (hltb.similarity * 100).toFixed(0),
                                "%)")),
                        hltb.main_extra && (React__default["default"].createElement("div", { style: styles$1.statRow },
                            React__default["default"].createElement("span", null, "Main+Extra:"),
                            React__default["default"].createElement("span", null,
                                hltb.main_extra,
                                "h")))))),
                React__default["default"].createElement("div", { style: styles$1.section },
                    React__default["default"].createElement("h3", { style: styles$1.sectionTitle }, "Current Tag"),
                    React__default["default"].createElement("div", { style: styles$1.statRow }, tag?.tag ? (React__default["default"].createElement("span", null,
                        tag.tag.replace('_', ' ').toUpperCase(),
                        tag.is_manual ? ' (Manual)' : ' (Automatic)')) : (React__default["default"].createElement("span", null, "No tag assigned")))),
                React__default["default"].createElement("div", { style: styles$1.section },
                    React__default["default"].createElement("h3", { style: styles$1.sectionTitle }, "Set Tag"),
                    React__default["default"].createElement("div", { style: styles$1.buttonGroup },
                        React__default["default"].createElement("button", { onClick: () => setTag('completed'), style: styles$1.tagButton }, "Completed"),
                        React__default["default"].createElement("button", { onClick: () => setTag('in_progress'), style: styles$1.tagButton }, "In Progress"),
                        React__default["default"].createElement("button", { onClick: () => setTag('mastered'), style: styles$1.tagButton }, "Mastered")),
                    React__default["default"].createElement("div", { style: styles$1.buttonGroup },
                        React__default["default"].createElement("button", { onClick: resetToAuto, style: styles$1.secondaryButton }, "Reset to Automatic"),
                        React__default["default"].createElement("button", { onClick: removeTag, style: styles$1.secondaryButton }, "Remove Tag"))),
                React__default["default"].createElement("button", { onClick: onClose, style: styles$1.closeButton }, "Close"))));
    };
    const styles$1 = {
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
        buttonGroup: {
            display: 'flex',
            gap: '8px',
            marginBottom: '8px',
            flexWrap: 'wrap',
        },
        tagButton: {
            flex: 1,
            padding: '12px',
            backgroundColor: '#667eea',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
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

    /**
     * Settings Component
     * Plugin settings and configuration panel
     */
    const Settings = ({ serverAPI }) => {
        const [settings, setSettings] = React.useState({
            auto_tag_enabled: true,
            mastered_multiplier: 1.5,
            in_progress_threshold: 60,
            cache_ttl: 7200
        });
        const [stats, setStats] = React.useState(null);
        const [loading, setLoading] = React.useState(false);
        const [syncing, setSyncing] = React.useState(false);
        const [message, setMessage] = React.useState(null);
        React.useEffect(() => {
            loadSettings();
            loadStats();
        }, []);
        const loadSettings = async () => {
            try {
                const response = await serverAPI.callPluginMethod('get_settings', {});
                if (response.result.settings) {
                    setSettings(response.result.settings);
                }
            }
            catch (err) {
                console.error('Error loading settings:', err);
            }
        };
        const loadStats = async () => {
            try {
                const response = await serverAPI.callPluginMethod('get_tag_statistics', {});
                if (response.result.stats) {
                    setStats(response.result.stats);
                }
            }
            catch (err) {
                console.error('Error loading stats:', err);
            }
        };
        const updateSetting = async (key, value) => {
            const newSettings = { ...settings, [key]: value };
            setSettings(newSettings);
            try {
                await serverAPI.callPluginMethod('update_settings', {
                    settings: newSettings
                });
                showMessage('Settings saved');
            }
            catch (err) {
                console.error('Error updating settings:', err);
                showMessage('Failed to save settings');
            }
        };
        const syncLibrary = async () => {
            try {
                setSyncing(true);
                setMessage('Syncing library... This may take several minutes.');
                const response = await serverAPI.callPluginMethod('sync_library', {});
                const result = response.result;
                if (result.success) {
                    showMessage(`Sync complete! ${result.synced}/${result.total} games synced. ` +
                        (result.errors ? `${result.errors} errors.` : ''));
                    await loadStats();
                }
                else {
                    showMessage(`Sync failed: ${result.error}`);
                }
            }
            catch (err) {
                console.error('Error syncing library:', err);
                showMessage(`Sync error: ${err?.message || 'Unknown error'}`);
            }
            finally {
                setSyncing(false);
            }
        };
        const refreshCache = async () => {
            try {
                setLoading(true);
                await serverAPI.callPluginMethod('refresh_hltb_cache', {});
                showMessage('Cache will be refreshed on next sync');
            }
            catch (err) {
                console.error('Error refreshing cache:', err);
                showMessage('Failed to refresh cache');
            }
            finally {
                setLoading(false);
            }
        };
        const showMessage = (msg) => {
            setMessage(msg);
            setTimeout(() => setMessage(null), 5000);
        };
        return (React__default["default"].createElement("div", { style: styles.container },
            React__default["default"].createElement("h2", { style: styles.title }, "Game Progress Tracker"),
            message && (React__default["default"].createElement("div", { style: styles.message }, message)),
            stats && (React__default["default"].createElement("div", { style: styles.section },
                React__default["default"].createElement("h3", { style: styles.sectionTitle }, "Library Statistics"),
                React__default["default"].createElement("div", { style: styles.statGrid },
                    React__default["default"].createElement("div", { style: styles.statCard },
                        React__default["default"].createElement("div", { style: styles.statValue }, stats.completed),
                        React__default["default"].createElement("div", { style: styles.statLabel }, "Completed")),
                    React__default["default"].createElement("div", { style: styles.statCard },
                        React__default["default"].createElement("div", { style: styles.statValue }, stats.in_progress),
                        React__default["default"].createElement("div", { style: styles.statLabel }, "In Progress")),
                    React__default["default"].createElement("div", { style: styles.statCard },
                        React__default["default"].createElement("div", { style: styles.statValue }, stats.mastered),
                        React__default["default"].createElement("div", { style: styles.statLabel }, "Mastered")),
                    React__default["default"].createElement("div", { style: styles.statCard },
                        React__default["default"].createElement("div", { style: styles.statValue }, stats.total),
                        React__default["default"].createElement("div", { style: styles.statLabel }, "Total Tagged"))))),
            React__default["default"].createElement("div", { style: styles.section },
                React__default["default"].createElement("h3", { style: styles.sectionTitle }, "Automatic Tagging"),
                React__default["default"].createElement("div", { style: styles.settingRow },
                    React__default["default"].createElement("label", { style: styles.label },
                        React__default["default"].createElement("input", { type: "checkbox", checked: settings.auto_tag_enabled, onChange: (e) => updateSetting('auto_tag_enabled', e.target.checked), style: styles.checkbox }),
                        "Enable Auto-Tagging"))),
            React__default["default"].createElement("div", { style: styles.section },
                React__default["default"].createElement("h3", { style: styles.sectionTitle }, "Tag Thresholds"),
                React__default["default"].createElement("div", { style: styles.settingRow },
                    React__default["default"].createElement("label", { style: styles.label },
                        "Mastered Multiplier: ",
                        settings.mastered_multiplier,
                        "x"),
                    React__default["default"].createElement("input", { type: "range", min: "1.0", max: "3.0", step: "0.1", value: settings.mastered_multiplier, onChange: (e) => updateSetting('mastered_multiplier', parseFloat(e.target.value)), style: styles.slider }),
                    React__default["default"].createElement("div", { style: styles.hint }, "Playtime must be this many times the HLTB completion time")),
                React__default["default"].createElement("div", { style: styles.settingRow },
                    React__default["default"].createElement("label", { style: styles.label },
                        "In Progress Threshold: ",
                        settings.in_progress_threshold,
                        " minutes"),
                    React__default["default"].createElement("input", { type: "range", min: "15", max: "300", step: "15", value: settings.in_progress_threshold, onChange: (e) => updateSetting('in_progress_threshold', parseInt(e.target.value)), style: styles.slider }),
                    React__default["default"].createElement("div", { style: styles.hint }, "Minimum playtime to mark as In Progress"))),
            React__default["default"].createElement("div", { style: styles.section },
                React__default["default"].createElement("h3", { style: styles.sectionTitle }, "Data Management"),
                React__default["default"].createElement("button", { onClick: syncLibrary, disabled: syncing || loading, style: syncing ? styles.buttonDisabled : styles.button }, syncing ? 'Syncing...' : 'Sync Entire Library'),
                React__default["default"].createElement("button", { onClick: refreshCache, disabled: syncing || loading, style: styles.buttonSecondary }, "Refresh HLTB Cache"),
                React__default["default"].createElement("div", { style: styles.hint }, "Sync may take several minutes for large libraries")),
            React__default["default"].createElement("div", { style: styles.section },
                React__default["default"].createElement("h3", { style: styles.sectionTitle }, "About"),
                React__default["default"].createElement("div", { style: styles.about },
                    React__default["default"].createElement("p", null, "Game Progress Tracker v1.0.0"),
                    React__default["default"].createElement("p", null, "Automatic game tagging based on achievements, playtime, and completion time."),
                    React__default["default"].createElement("p", { style: styles.smallText }, "Data from HowLongToBeat \u2022 Steam achievement system")))));
    };
    const styles = {
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

    /**
     * React hook for managing game tags
     */
    function useGameTag(serverAPI, appid) {
        const [tag, setTag] = React.useState(null);
        const [loading, setLoading] = React.useState(true);
        const [error, setError] = React.useState(null);
        React.useEffect(() => {
            fetchTag();
        }, [appid]);
        const fetchTag = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await serverAPI.callPluginMethod('get_game_tag', {
                    appid: appid
                });
                setTag(response.result.tag);
            }
            catch (err) {
                setError(err?.message || 'Failed to fetch tag');
                console.error('Error fetching tag:', err);
            }
            finally {
                setLoading(false);
            }
        };
        const setManualTag = async (newTag) => {
            try {
                setError(null);
                const response = await serverAPI.callPluginMethod('set_manual_tag', {
                    appid: appid,
                    tag: newTag
                });
                if (response.result.success) {
                    await fetchTag();
                }
                else {
                    setError(response.result.error || 'Failed to set tag');
                }
            }
            catch (err) {
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
                }
                else {
                    setError(response.result.error || 'Failed to remove tag');
                }
            }
            catch (err) {
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
                }
                else {
                    setError(response.result.error || 'Failed to reset tag');
                }
            }
            catch (err) {
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

    /**
     * Game Progress Tracker - Main Plugin Entry
     * Decky Loader plugin for automatic game tagging
     */
    /**
     * Extract appid from route path
     */
    function extractAppId(path) {
        const match = path.match(/\/library\/app\/(\d+)/);
        return match ? match[1] : null;
    }
    /**
     * Game Page Overlay Component
     * Displays tag badge and manages tag editor
     */
    const GamePageOverlay = ({ serverAPI, appid }) => {
        const { tag, loading } = useGameTag(serverAPI, appid);
        const [showManager, setShowManager] = React.useState(false);
        if (loading || !tag) {
            return null;
        }
        return (React__default["default"].createElement(React__default["default"].Fragment, null,
            React__default["default"].createElement(GameTag, { tag: tag, onClick: () => setShowManager(true) }),
            showManager && (React__default["default"].createElement(TagManager, { serverAPI: serverAPI, appid: appid, onClose: () => setShowManager(false) }))));
    };
    /**
     * Main Plugin Definition
     */
    var index = deckyFrontendLib.definePlugin((serverAPI) => {
        let gamePagePatch;
        // Patch the game library page to inject our tag component
        gamePagePatch = serverAPI.routerHook.addPatch('/library/app/:appId', (props) => {
            const appid = extractAppId(props.path);
            if (appid) {
                return (React__default["default"].createElement(React__default["default"].Fragment, null,
                    props.children,
                    React__default["default"].createElement(GamePageOverlay, { serverAPI: serverAPI, appid: appid })));
            }
            return props.children;
        });
        return {
            title: React__default["default"].createElement("div", { className: deckyFrontendLib.staticClasses.Title }, "Game Progress Tracker"),
            content: React__default["default"].createElement(Settings, { serverAPI: serverAPI }),
            icon: (React__default["default"].createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", width: "24", height: "24" },
                React__default["default"].createElement("path", { d: "M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.87 0-7-3.13-7-7V8.3l7-3.11 7 3.11V13c0 3.87-3.13 7-7 7zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z" }))),
            onDismount() {
                // Clean up patches when plugin is unloaded
                serverAPI.routerHook.removePatch(gamePagePatch);
            }
        };
    });

    return index;

})(DFL, SP_REACT);
