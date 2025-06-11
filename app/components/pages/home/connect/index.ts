/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AppConfig } from '@nuxt/schema';
import type { ButtonProps, LinkProps, ComponentConfig } from '@nuxt/ui';
import type themeSection from '#build/ui-pro/page-section';
import type themeFeature from '#build/ui-pro/page-feature';
type PageSection = ComponentConfig<typeof themeSection, AppConfig, 'pageSection', 'uiPro'>;;
type PageFeature = ComponentConfig<typeof themeFeature, AppConfig, 'pageFeature', 'uiPro'>;
export { default as Connect } from './Connect.vue'

export interface PageFeatureProps {
    as?: any;
    icon?: string;
    title?: string;
    description?: string;
    orientation?: PageFeature['variants']['orientation'];
    to?: LinkProps['to'];
    target?: LinkProps['target'];
    onClick?: (event: MouseEvent) => void | Promise<void>;
    class?: any;
    ui?: PageFeature['slots'];
}

export interface ConnectProps {
    as?: any;
    headline?: string;
    icon?: string;
    title?: string;
    description?: string;
    links?: ButtonProps[];
    features?: PageFeatureProps[];
    orientation?: PageSection['variants']['orientation'];
    reverse?: boolean;
    class?: any;
    ui?: PageSection['slots'];

    // form: {}
}