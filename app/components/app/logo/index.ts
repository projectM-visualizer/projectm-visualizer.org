export { default as Logo } from './Logo.vue'

export interface LogoProps {
    src: string;
    alt: string;
    text: string;
    showText?: boolean;
    link?: string;
    enableLink?: boolean;
    size?: "sm" | "md" | "lg";
}