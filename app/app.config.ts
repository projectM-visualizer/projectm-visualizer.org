export default defineAppConfig({
  organization: {
    name: 'ProjectM Visualizer',

    social: {
      github: {
        icon: 'i-simple-icons-github',
        label: 'GitHub',
        username: 'ProjectM Visualizer',
        to: 'https://github.com/projectm-visualizer'
      },
      x: {
        icon: 'i-simple-icons-x',
        label: 'X (formerly Twitter)',
        username: '@ProjectMVisualizer',
        to: 'https://twitter.com/projectm-visualizer'
      },
      mastodon: {
        icon: 'i-simple-icons-mastodon',
        label: 'Mastodon',
        username: 'ProjectM Visualizer',
        to: 'https://fosstodon.org/@projectm-visualizer'
      },
      discord: {
        icon: 'i-simple-icons-discord',
        label: 'Discord',
        username: 'ProjectM Visualizer',
        to: 'https://discord.gg/projectm-visualizer'
      },
      youtube: {
        icon: 'i-simple-icons-youtube',
        label: 'YouTube',
        username: 'ProjectM Visualizer',
        to: 'https://www.youtube.com/@projectm-visualizer'
      },
    }
  },
  
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'slate',
    },
    button: {
      defaultVariants: {
        // Set default button color to neutral
        // color: 'neutral'
      }
    }
  },
})
