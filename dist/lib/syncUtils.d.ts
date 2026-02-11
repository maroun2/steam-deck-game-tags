/**
 * Sync Utilities
 * Shared functions for syncing game data using Steam's frontend API
 */
/**
 * Achievement data structure
 */
export interface AchievementData {
    total: number;
    unlocked: number;
}
/**
 * Sync result from backend
 */
export interface SyncResult {
    success: boolean;
    total?: number;
    synced?: number;
    errors?: number;
    error?: string;
}
/**
 * Get achievement data for a list of appids from Steam's frontend API
 * Uses window.appAchievementProgressCache which is Steam's internal achievement cache
 */
export declare const getAchievementData: (appids: string[]) => Promise<Record<string, AchievementData>>;
/**
 * Get playtime data for a list of appids from Steam's frontend API
 * Uses window.appStore which is Steam's internal game data cache
 */
export declare const getPlaytimeData: (appids: string[]) => Promise<Record<string, number>>;
/**
 * Sync library with frontend data (playtime + achievements from Steam API)
 * This is the main sync function that should be used instead of backend-only sync
 */
export declare const syncLibraryWithFrontendData: () => Promise<SyncResult>;
