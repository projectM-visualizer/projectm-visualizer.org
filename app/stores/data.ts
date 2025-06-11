import { defineStore, acceptHMRUpdate } from 'pinia'
import type { FooterProps } from '~/components/app/footer'
import type { NavbarProps } from '~/components/app/navbar'
import type { HeroProps } from '~/components/pages/home/hero'
import type { ProjectItem, ProjectsProps } from '~/components/pages/home/projects'
import type { ContributorItem, ContributorsProps } from '~/components/pages/home/contributors'
import type { AboutProps } from '~/components/pages/home/about'
import type { ConnectProps } from '~/components/pages/home/connect'

const projectsJson = (await import('~~/content/projects.json')).default as ProjectItem[]
const contributorJson = (await import('~~/content/contributors.json')).default as ContributorItem[]

export const useDataStore = defineStore('data', () => {
  const { organization } = useAppConfig()

  const navbar = reactive<NavbarProps>({
    logo: {
      src: "",
      alt: `${organization.name} Logo`,
      text: organization.name,
      showText: true,
    },
    menuItems: [
      {
        icon: 'i-lucide-book-open',
        label: 'Docs',
        to: '/docs',
        children: [
          {
            icon: 'i-lucide-book-text',
            label: 'User Guide',
            description: 'Get started with our user-friendly guide.',
            to: '/docs/user',
          },
          {
            icon: 'i-lucide-code-xml',
            label: 'Developer Guide',
            description: 'Dive into our developer documentation.',
            to: '/docs/developer',
          },
        ]
      },
      {
        icon: 'i-lucide-folder-root',
        label: 'Projects',
        to: '/projects',
      },
      {
        icon: 'i-lucide-notebook-pen',
        label: 'Blog',
        to: '/blog',
        disabled: true,
      },
      {
        icon: 'i-simple-icons-github',
        label: organization.social.github.label,
        to: organization.social.github.to,
        target: '_blank'
      },
    ],
    enableSearch: true,
    enableColorModeButton: true,
    customButtons: [
      // {
      //     icon: 'i-simple-icons-github',
      //     to: organization.social.github.to,
      //     target: "_blank",
      //     ariaLabel: organization.social.github.label,
      // },
    ],
  })
  const footer = reactive<FooterProps>({
    copyright: `Copyright © ${new Date().getFullYear()
      } ${organization.name}. All rights reserved.`,
    menuItems: [
      {
        icon: '',
        label: 'Privacy Policy',
        to: '/privacy-policy',
        target: '_blank',
      },
      {
        icon: '',
        label: 'Terms of Service',
        to: '/terms-of-service',
        target: '_blank',
      },
    ],
    socialButtons: [
      {
        icon: organization.social.youtube.icon,
        ariaLabel: organization.social.youtube.label,
        to: organization.social.youtube.to,
        target: '_blank',
      },
      {
        icon: organization.social.mastodon.icon,
        ariaLabel: organization.social.mastodon.label,
        to: organization.social.mastodon.to,
        target: '_blank',
      },

      {
        icon: organization.social.x.icon,
        ariaLabel: organization.social.x.label,
        to: organization.social.x.to,
        target: '_blank',
      },
      {
        icon: organization.social.discord.icon,
        ariaLabel: organization.social.discord.label,
        to: organization.social.discord.to,
        target: '_blank',
      },
      {
        icon: organization.social.github.icon,
        ariaLabel: organization.social.github.label,
        to: organization.social.github.to,
        target: '_blank',
      },
    ]
  })

  const home = reactive<{
    hero: HeroProps
    projects: ProjectsProps
    contributors: ContributorsProps,
    about: AboutProps,
    connect: ConnectProps
  }>({
    hero: {
      orientation: "horizontal",
      title: "Feel the Music. See the Sound.",
      description: "A real-time music visualizer that transforms your audio into stunning, responsive visuals. From bass drops to melodies, experience your music like never before.",
      headline: "Turn Every Beat into a Spectacle",
      
      links: [
        {
          label: 'Download',
          to: '/download',
          icon: 'i-lucide-square-play'
        },
        {
          label: 'Docs',
          to: '/docs/user',
          icon: 'i-lucide-book-text',
          color: 'neutral',
          variant: 'subtle',
          trailingIcon: 'i-lucide-arrow-right'
        }
      ],
      videoPlayer: {
        src: '/assets/videos/hero-1.mp4',
        // poster: '',
        fluid: true,
        autoplay: true,
        loop: true,
        muted: true,
        volume: 0.6,
        controls: true,
      }
    },
    projects: {
      items: projectsJson,
      itemsToShow: 6,
      sortBy: 'stars',
      featured: []
    },
    contributors: {
      items: contributorJson,
      pauseOnHover: true,
      repeat: 2,
    },
    about: {
      reverse: false,
      orientation: 'horizontal',
      icon: 'i-lucide-equal-approximately',
      title: "About Us",
      summary: [
        "ProjectM is an open-source, cross-platform music visualization software library designed to replicate the behavior and aesthetic of the well-known MilkDrop plugin originally developed for Winamp by Ryan Geiss. MilkDrop was notable for allowing user-created visualization scripts or “presets,” which generated real-time, beat-synced visual effects based on audio input.", 
        "To offer MilkDrop-style visualizations on non-Windows systems and in open-source environments, projectM was initiated in 2003 and released in 2004 under the LGPL v2.1 license. Its core component is libprojectM, a C++ library that renders visualizations by processing audio signals using FFT and other techniques, and applies MilkDrop-compatible scripts to generate graphics using OpenGL."
      ],
    },
    connect: {
      reverse: true,
      orientation: 'horizontal',
      icon: 'i-lucide-spline',
      title: "Connect With Us",
      description: "Have questions or feedback? We'd love to hear from you!",
    }
  })

  const projects = reactive<ProjectsProps>({
    items: projectsJson,
    itemsToShow: 0,
    sortBy: 'stars',
    featured: []
  })

  return { 
    navbar, 
    footer, 
    home,
    projects
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDataStore, import.meta.hot))
}
