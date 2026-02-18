/**
 * Library Grid Patching
 * Adds tag icons to game covers in the library grid view
 */

import { routerHook } from '@decky/api';
import React from 'react';
import { LibraryTagIcon, preloadAllTags } from '../components/LibraryTagIcon';

// Debug logging helper
const log = (msg: string, data?: any) => {
  const logMsg = `[GameProgressTracker][patchLibraryGrid] ${msg}`;
  if (data !== undefined) {
    console.log(logMsg, data);
  } else {
    console.log(logMsg);
  }
};

/**
 * Extract app ID from Steam image URL
 * URLs are in format: /assets/{APP_ID}/library_600x900.jpg
 */
function extractAppIdFromImageUrl(url: string): string | null {
  const match = url.match(/\/assets\/(\d+)\//);
  return match ? match[1] : null;
}

/**
 * Create an icon element for a game
 */
function createIconElement(appId: string): HTMLDivElement {
  const iconContainer = document.createElement('div');
  iconContainer.className = 'game-progress-tracker-icon';
  iconContainer.dataset.appid = appId;

  // Get cached tag if available
  const cachedTag = (window as any).__gameProgressTrackerCache?.tags?.[appId];

  if (cachedTag?.tag) {
    // Create a simple DOM element for the icon (non-React approach for now)
    const iconStyle = `
      position: absolute;
      top: 4px;
      right: 4px;
      width: 28px;
      height: 28px;
      background-color: rgba(0, 0, 0, 0.8);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
      z-index: 10;
      pointer-events: none;
    `;

    iconContainer.style.cssText = iconStyle;

    // Add a simple text indicator for now
    const tagColors: Record<string, string> = {
      mastered: '#f5576c',
      completed: '#38ef7d',
      in_progress: '#764ba2',
      backlog: '#888',
      dropped: '#c9a171',
    };

    iconContainer.style.border = `2px solid ${tagColors[cachedTag.tag] || '#666'}`;

    // Add a simple emoji or letter based on tag type
    const tagSymbols: Record<string, string> = {
      mastered: '★',
      completed: '✓',
      in_progress: '▶',
      backlog: '○',
      dropped: '✗',
    };

    iconContainer.innerHTML = `<span style="color: ${tagColors[cachedTag.tag] || '#fff'}; font-size: 14px; font-weight: bold;">${tagSymbols[cachedTag.tag] || '?'}</span>`;
    iconContainer.title = cachedTag.tag.replace('_', ' ').toUpperCase();
  }

  return iconContainer;
}

/**
 * Process a game cover image and add tag icon
 */
function processGameImage(img: HTMLImageElement): void {
  // Skip if already processed
  if (img.dataset.tagProcessed === 'true') {
    return;
  }

  // Extract app ID from image URL
  const appId = extractAppIdFromImageUrl(img.src);
  if (!appId) {
    return;
  }

  // Mark as processed
  img.dataset.tagProcessed = 'true';
  img.dataset.appid = appId;

  // Find or create wrapper container
  let wrapper = img.parentElement;

  // Make sure the wrapper has relative positioning for our absolute icon
  if (wrapper) {
    const currentPosition = window.getComputedStyle(wrapper).position;
    if (currentPosition === 'static' || currentPosition === '') {
      wrapper.style.position = 'relative';
    }

    // Create and add the icon element
    try {
      const iconElement = createIconElement(appId);
      wrapper.appendChild(iconElement);
      log(`Added tag icon for app ${appId}`);
    } catch (err) {
      log(`Error adding tag icon for ${appId}:`, err);
    }
  }
}

/**
 * Process all game images currently in the DOM
 */
function processAllGameImages(): void {
  // Find all library game cover images
  const images = document.querySelectorAll<HTMLImageElement>(
    'img[src*="/assets/"][src*="/library_600x900.jpg"]'
  );

  log(`Found ${images.length} game cover images`);

  images.forEach(img => {
    processGameImage(img);
  });
}

/**
 * Clean up icons (remove from DOM)
 */
function cleanupIcons(): void {
  const icons = document.querySelectorAll('.game-progress-tracker-icon');
  icons.forEach(icon => {
    icon.remove();
  });

  // Reset processed flags
  const images = document.querySelectorAll<HTMLImageElement>('img[data-tag-processed]');
  images.forEach(img => {
    delete img.dataset.tagProcessed;
  });
}

/**
 * Set up mutation observer to handle dynamically loaded games
 */
function setupMutationObserver(): MutationObserver {
  const observer = new MutationObserver((mutations) => {
    let hasNewImages = false;

    for (const mutation of mutations) {
      // Check added nodes for images
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;

          // Check if it's an image or contains images
          if (element.tagName === 'IMG') {
            const img = element as HTMLImageElement;
            if (img.src.includes('/assets/') && img.src.includes('/library_600x900.jpg')) {
              hasNewImages = true;
              processGameImage(img);
            }
          } else {
            // Check for images within the added element
            const images = element.querySelectorAll<HTMLImageElement>(
              'img[src*="/assets/"][src*="/library_600x900.jpg"]'
            );
            if (images.length > 0) {
              hasNewImages = true;
              images.forEach(processGameImage);
            }
          }
        }
      });
    }

    if (hasNewImages) {
      log('New game images detected and processed');
    }
  });

  // Start observing the body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return observer;
}

let currentObserver: MutationObserver | null = null;

/**
 * Initialize library grid patching for a specific route
 */
function initializeLibraryPatching(): void {
  log('Initializing library grid patching');

  // Preload all tags for better performance
  preloadAllTags().then(() => {
    log('Tags preloaded');

    // Process existing images
    processAllGameImages();

    // Set up observer for new images
    if (currentObserver) {
      currentObserver.disconnect();
    }
    currentObserver = setupMutationObserver();
  });
}

/**
 * Clean up when leaving library routes
 */
function cleanupLibraryPatching(): void {
  log('Cleaning up library grid patching');

  if (currentObserver) {
    currentObserver.disconnect();
    currentObserver = null;
  }

  cleanupIcons();
}

/**
 * Patch library routes to add tag icons
 */
function patchLibraryGrid() {
  log('Setting up library grid patch');

  // Patch multiple library routes
  const libraryRoutes = [
    '/library/home',
    '/library/collection/:collection',
    '/library',
  ];

  const patches: Array<() => void> = [];

  libraryRoutes.forEach(route => {
    const unpatch = routerHook.addPatch(
      route,
      (routeProps: any) => {
        log(`Route patch triggered for ${route}`);

        // Wait a bit for the library to render
        setTimeout(() => {
          initializeLibraryPatching();
        }, 500);

        // Clean up when navigating away
        const originalComponentWillUnmount = routeProps.componentWillUnmount;
        routeProps.componentWillUnmount = function() {
          cleanupLibraryPatching();
          if (originalComponentWillUnmount) {
            originalComponentWillUnmount.call(this);
          }
        };

        return routeProps;
      }
    );

    patches.push(unpatch);
  });

  // Also try to initialize immediately if we're already on a library page
  if (window.location.href.includes('/library')) {
    setTimeout(() => {
      initializeLibraryPatching();
    }, 1000);
  }

  // Return cleanup function
  return () => {
    log('Removing library grid patches');
    cleanupLibraryPatching();
    patches.forEach(unpatch => unpatch());
  };
}

export default patchLibraryGrid;