/**
 * TagManager Component
 * Modal for managing game tags manually
 */
import { VFC } from 'react';
import { ServerAPI } from '../types';
interface TagManagerProps {
    serverAPI: ServerAPI;
    appid: string;
    onClose: () => void;
}
export declare const TagManager: VFC<TagManagerProps>;
export {};
