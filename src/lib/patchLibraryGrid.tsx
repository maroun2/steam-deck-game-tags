/**
 * Library Grid Patcher - TabsHook exploration version
 *
 * Logs everything about Decky's tabsHook to understand cross-context capabilities
 */

import { routerHook } from '@decky/api';
import { call } from '@decky/api';

// Comprehensive logging function
const log = (context: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const logMsg = `[GPT][${timestamp}][${context}] ${message}`;

  if (data !== undefined) {
    console.log(logMsg, data);
    // Also log to backend for persistent logging
    call('log_frontend', { message: logMsg, data: JSON.stringify(data) }).catch(() => {});
  } else {
    console.log(logMsg);
    call('log_frontend', { message: logMsg }).catch(() => {});
  }
};

/**
 * Main patch function - explores tabsHook and logs everything
 */
export default function patchLibraryGrid() {
  log('Init', '🚀 Starting library grid patcher - TabsHook exploration');

  // Explore what's available in Decky
  const exploreDeckyAPIs = () => {
    log('Explore', '🔍 Exploring Decky APIs...');

    // Check for DeckyPluginLoader
    if (!(window as any).DeckyPluginLoader) {
      log('Explore', '❌ DeckyPluginLoader not found!');
      return;
    }

    const decky = (window as any).DeckyPluginLoader;
    log('Explore', '✅ DeckyPluginLoader found', {
      keys: Object.keys(decky),
      hasTabsHook: !!decky.tabsHook
    });

    // Deep explore tabsHook
    if (decky.tabsHook) {
      const tabsHook = decky.tabsHook;
      log('TabsHook', '📋 Found tabsHook!', {
        type: typeof tabsHook,
        keys: Object.keys(tabsHook)
      });

      // Explore each property/method in tabsHook
      Object.keys(tabsHook).forEach(key => {
        const value = tabsHook[key];
        const valueType = typeof value;

        if (valueType === 'function') {
          log('TabsHook', `  Method: ${key}()`, {
            argCount: value.length,
            name: value.name || 'anonymous'
          });

          // Try to get function source
          try {
            const src = value.toString();
            log('TabsHook', `    ${key} source preview:`, src.substring(0, 300));
          } catch (e) {
            log('TabsHook', `    Could not get source for ${key}`);
          }

          // Try calling safe getter methods
          if (key.toLowerCase().includes('get') || key.toLowerCase().includes('tabs')) {
            try {
              const result = value();
              log('TabsHook', `    ${key}() returned:`, result);
            } catch (e: any) {
              log('TabsHook', `    ${key}() error:`, e?.message || e);
            }
          }
        } else {
          log('TabsHook', `  Property: ${key}`, {
            type: valueType,
            value: valueType === 'object' ? Object.keys(value || {}) : value
          });
        }
      });
    }

    // Also explore SteamClient for tab-related methods
    if ((window as any).SteamClient) {
      const steamClient = (window as any).SteamClient;
      const tabMethods = Object.keys(steamClient).filter(key =>
        key.toLowerCase().includes('tab') ||
        key.toLowerCase().includes('exec') ||
        key.toLowerCase().includes('inject') ||
        key.toLowerCase().includes('browser')
      );

      if (tabMethods.length > 0) {
        log('SteamClient', '🎮 Found tab-related SteamClient methods:', tabMethods);
      }
    }
  };

  // Set up route patches
  const libraryRoutes = [
    '/library',
    '/library/home',
    '/library/tab/:tab',
    '/routes/library',
    '/routes/library/tab/:tab'
  ];

  const patches: any[] = [];

  libraryRoutes.forEach(route => {
    try {
      const unpatch = routerHook.addPatch(route, (routeProps: any) => {
        log('Route', `📍 Route triggered: ${route}`);

        // Log route props structure
        if (routeProps) {
          log('Route', 'Route props keys:', Object.keys(routeProps));

          if (routeProps.children) {
            log('Route', 'Children info:', {
              type: typeof routeProps.children.type,
              hasProps: !!routeProps.children.props,
              propKeys: routeProps.children.props ? Object.keys(routeProps.children.props).slice(0, 10) : []
            });

            // Log children.type if it's a function
            if (typeof routeProps.children.type === 'function') {
              const funcStr = routeProps.children.type.toString();
              log('Route', 'Children.type function preview:', funcStr.substring(0, 500));
            }
          }
        }

        // Re-explore APIs on each route trigger
        setTimeout(() => {
          log('Route', '🔄 Re-exploring APIs after route change...');
          exploreDeckyAPIs();
        }, 100);

        return routeProps;
      });

      patches.push(unpatch);
      log('Setup', `✅ Registered patch for ${route}`);
    } catch (error) {
      log('Setup', `❌ Failed to patch ${route}:`, error);
    }
  });

  // Initial exploration
  log('Init', '🔍 Running initial API exploration...');
  exploreDeckyAPIs();

  // Return cleanup function
  return () => {
    log('Cleanup', '🧹 Removing library grid patches...');
    patches.forEach(unpatch => {
      try {
        unpatch();
      } catch (e) {
        log('Cleanup', 'Error during cleanup:', e);
      }
    });
  };
}