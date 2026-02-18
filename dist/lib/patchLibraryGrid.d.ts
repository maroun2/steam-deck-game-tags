/**
 * Library Grid Patching
 * Adds tag icons to game covers in the library grid view
 * Uses React tree patching approach (like detail pages) instead of DOM manipulation
 */
/**
 * Patch library routes to add tag icons using React tree patching
 */
declare function patchLibraryGrid(): () => void;
export default patchLibraryGrid;
