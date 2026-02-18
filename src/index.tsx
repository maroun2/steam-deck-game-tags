/**
 * Game Progress Tracker - Main Plugin Entry
 * Decky Loader plugin for automatic game tagging
 *
 * Uses safe route patching pattern based on ProtonDB Badges plugin
 */

import { staticClasses } from '@decky/ui';
import { definePlugin, routerHook, toaster } from '@decky/api';
import React from 'react';
import { FaTrophy } from 'react-icons/fa';
import { Settings } from './components/Settings';
import patchLibraryApp from './lib/patchLibraryApp';
import patchLibraryGrid from './lib/patchLibraryGrid';
import { syncLibraryWithFrontendData } from './lib/syncUtils';
import { startAchievementCacheWatcher, stopAchievementCacheWatcher } from './lib/achievementCacheWatcher';

// Debug logging helper
const log = (msg: string, data?: any) => {
  const logMsg = `[GameProgressTracker] ${msg}`;
  if (data !== undefined) {
    console.log(logMsg, data);
  } else {
    console.log(logMsg);
  }
};

/**
 * Main Plugin Definition
 */
export default definePlugin(() => {
  log('=== Plugin initializing ===');

  // Patch the game library page using the safe ProtonDB-style approach
  log('Setting up library app patch');
  let libraryPatch: ReturnType<typeof patchLibraryApp> | null = null;
  let libraryGridPatch: ReturnType<typeof patchLibraryGrid> | null = null;

  try {
    libraryPatch = patchLibraryApp();
    log('Library app patch registered successfully');
  } catch (error) {
    log('Failed to register library app patch:', error);
  }

  // Patch the library grid view to add tag icons
  log('Setting up library grid patch');
  try {
    libraryGridPatch = patchLibraryGrid();
    log('Library grid patch registered successfully');
  } catch (error) {
    log('Failed to register library grid patch:', error);
  }

  // Start achievement cache watcher (monitors when user views "Your Stuff" tab)
  log('Starting achievement cache watcher');
  startAchievementCacheWatcher();

  // Trigger sync with frontend data (replaces backend auto-sync)
  // This uses Steam's frontend API for real-time playtime and achievement data
  log('Triggering initial sync with frontend data...');
  (async () => {
    try {
      const result = await syncLibraryWithFrontendData();
      log('Initial sync result:', result);

      // Show toast notification when initial sync completes
      // Use new_tags count from backend for accurate notification
      if (result.success && result.synced && result.synced > 0) {
        const newTags = result.new_tags || 0;
        const message = newTags > 0
          ? `Synced ${result.synced} games. ${newTags} new tag${newTags > 1 ? 's' : ''} added!`
          : `Synced ${result.synced} games. Open plugin to see your library.`;

        toaster.toast({
          title: 'Game Progress Tracker',
          body: message,
          duration: 5000,
        });
      }
    } catch (err) {
      log('Initial sync failed:', err);
    }
  })();

  return {
    name: 'Game Progress Tracker',
    titleView: <div className={staticClasses.Title}>Game Progress Tracker</div>,
    content: <Settings />,
    icon: <FaTrophy />,
    onDismount() {
      log('=== Plugin dismounting ===');

      // Stop achievement cache watcher
      stopAchievementCacheWatcher();

      // Clean up patches when plugin is unloaded
      if (libraryPatch) {
        try {
          routerHook.removePatch('/library/app/:appid', libraryPatch);
          log('Library app patch removed successfully');
        } catch (error) {
          log('Error removing library app patch:', error);
        }
      }

      // Clean up library grid patch
      if (libraryGridPatch) {
        try {
          libraryGridPatch(); // This calls the cleanup function
          log('Library grid patch removed successfully');
        } catch (error) {
          log('Error removing library grid patch:', error);
        }
      }
    }
  };
});
