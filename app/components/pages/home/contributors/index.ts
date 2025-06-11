/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AppConfig } from '@nuxt/schema';
import type { ComponentConfig } from '@nuxt/ui';
import type theme from '#build/ui-pro/page-marquee';

type PageMarquee = ComponentConfig<typeof theme, AppConfig, 'pageMarquee', 'uiPro'>;
export { default as Contributors } from './Contributors.vue'

export interface ContributorItem {
    id: number;
    avatar_url: string;
    login: string;
    html_url: string;
}

export interface ContributorsProps {
    items?: ContributorItem[];
    as?: any;
    pauseOnHover?: boolean;
    reverse?: boolean;
    orientation?: PageMarquee['variants']['orientation'];
    repeat?: number;
    overlay?: boolean;
    class?: any;
    ui?: PageMarquee['slots'];
}