/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AppConfig } from '@nuxt/schema';
import type { ButtonProps, ComponentConfig } from '@nuxt/ui';
import type theme from '#build/ui-pro/page-header';
import type { VideoPlayerProps } from '@videojs-player/vue';

export type { VideoPlayerProps } from '@videojs-player/vue'
export { default as Hero } from './Hero.vue'

type PageHeader = ComponentConfig<typeof theme, AppConfig, 'pageHeader', 'uiPro'>;
export interface HeroProps {
    as?: any;
    headline?: string;
    title?: string;
    description?: string;
    links?: ButtonProps[];
    class?: any;
    orientation?: 'horizontal' | 'vertical';
    ui?: PageHeader['slots'];
    videoPlayer?: VideoPlayerProps;
}
