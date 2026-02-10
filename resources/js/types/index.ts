export type * from './auth';
export type * from './knowledge';
export type * from './navigation';
export type * from './ui';

import type { Auth } from './auth';
import type { KnowledgeDomain } from './knowledge';

export type SharedData = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    knowledgeDomains: KnowledgeDomain[];
    [key: string]: unknown;
};
