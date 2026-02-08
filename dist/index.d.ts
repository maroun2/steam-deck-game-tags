/**
 * Game Progress Tracker - Main Plugin Entry
 * Decky Loader plugin for automatic game tagging
 */
import { ServerAPI } from 'decky-frontend-lib';
import React from 'react';
/**
 * Main Plugin Definition
 */
export default function (serverAPI: ServerAPI): {
    title: React.JSX.Element;
    content: React.JSX.Element;
    icon: React.JSX.Element;
    onDismount(): void;
};
