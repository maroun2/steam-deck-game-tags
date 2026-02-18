/**
 * LibraryTagIcon Component
 * Small overlay icon for library grid view
 * Shows simplified tag indicator on game covers
 */
import { FC } from 'react';
interface LibraryTagIconProps {
    appId: string;
}
/**
 * LibraryTagIcon - Minimal icon overlay for library grid
 * Designed to be small and unobtrusive on game covers
 */
export declare const LibraryTagIcon: FC<LibraryTagIconProps>;
/**
 * Preload all tags for better performance
 * Call this once when the library loads
 */
export declare function preloadAllTags(): Promise<void>;
export default LibraryTagIcon;
