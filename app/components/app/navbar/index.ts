import type { ButtonProps, NavigationMenuItem } from '@nuxt/ui'
import type { LogoProps } from '@/components/app/logo'

export type { ButtonProps, NavigationMenuItem } from '@nuxt/ui'
export { default as Navbar } from './Navbar.vue'

export interface NavbarProps {
    logo: LogoProps,
    menuItems: NavigationMenuItem[],
    enableSearch: boolean,
    enableColorModeButton: boolean,
    customButtons?: (ButtonProps & {
        ariaLabel?: string
    })[];
}
