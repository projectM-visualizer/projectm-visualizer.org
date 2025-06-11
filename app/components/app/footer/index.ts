import type { ButtonProps, NavigationMenuItem } from '@nuxt/ui'

export type { ButtonProps, NavigationMenuItem } from '@nuxt/ui'
export { default as Footer } from './Footer.vue'

export interface FooterProps {
    copyright: string,
    menuItems: NavigationMenuItem[],
    socialButtons: (ButtonProps & {
        ariaLabel?: string
    })[];
}
