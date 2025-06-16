import { defineContentConfig, defineCollection, z } from '@nuxt/content'

const variantEnum = ['solid', 'outline', 'subtle', 'soft', 'ghost', 'link'] as const
const colorEnum = ['primary', 'secondary', 'neutral', 'error', 'warning', 'success', 'info'] as const
const sizeEnum = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const orientationEnum = ['vertical', 'horizontal'] as const

const createBaseSchema = () => z.object({
  title: z.string().nonempty(),
  description: z.string().nonempty()
})

const createLinkSchema = () => z.object({
  label: z.string().nonempty(),
  icon: z.string().optional().editor({ input: 'icon' }),
  trailing: z.boolean().optional(),
  description: z.string().optional(),
  to: z.string().nonempty(),
  target: z.string().optional(),

  size: z.enum(sizeEnum).optional(),
  color: z.enum(colorEnum).optional(),
  variant: z.enum(variantEnum).optional()
})

const createButtonSchema = () => createLinkSchema().extend({
  label: z.string().optional(),
  ariaLabel: z.string().optional(),
  to: z.string().optional()
})

const createImageSchema = () => z.object({
  src: z.string().nonempty().editor({ input: 'media' }),
  alt: z.string().optional(),
  loading: z.string().optional(),
  srcset: z.string().optional()
})

const createVideoSchema = () => z.object({
  src: z.string().optional(),
  srcMobile: z.string().optional(),
  poster: z.string().optional(),
  fluid: z.boolean().optional(),
  autoplay: z.boolean().optional(),
  loop: z.boolean().optional(),
  muted: z.boolean().optional(),
  controls: z.boolean().optional(),
  volume: z.number().optional()
})

const createDownloadItemSchema = () => z.object({
  icon: z.string().optional(),
  label: z.string().nonempty(),
  repoName: z.string().nonempty(),
  downloadUrl: z.string().nonempty(),
  version: z.string().optional(),
  releaseDate: z.string().optional()
})

const createDownloadPlatformSchema = () => z.object({
  icon: z.string().optional(),
  title: z.string().nonempty(),
  description: z.string().optional(),
  items: z.array(createDownloadItemSchema()).optional()
})

const collections = {
  app: defineCollection({
    type: 'data',
    source: 'app.yml',
    schema: z.object({
      links: z.array(createLinkSchema()).optional(),
      header: z.object({
        logo: z.object({
          to: z.string()
        }).optional(),
        enableColorModeButton: z.boolean().optional(),
        customButtons: z.array(createButtonSchema()).optional()
      }).optional(),
      footer: z.object({
        copyright: z.string().optional(),
        links: z.array(createLinkSchema()).optional(),
        socialButtons: z.array(createButtonSchema()).optional()
      }).optional()
    })
  }),
  index: defineCollection({
    type: 'page',
    source: '0.index.yml',
    schema: z.object({
      hero: createBaseSchema().extend({
        orientation: z.enum(orientationEnum).optional(),
        headline: z.string().optional(),
        links: z.array(createLinkSchema()).optional(),
        image: createImageSchema().optional(),
        video: createVideoSchema().optional()
      }).optional(),
      projects: createBaseSchema().extend({
        reverse: z.boolean().optional(),
        orientation: z.enum(orientationEnum).optional(),
        icon: z.string().optional(),
        itemsToShow: z.number().optional(),
        sortBy: z.enum(['name', 'updated', 'stars', 'forks']).optional(),
        featured: z.array(z.string()).optional()
      }).optional(),
      contributors: z.object({
        pauseOnHover: z.boolean().optional(),
        repeatCount: z.number().optional()
      }).optional(),
      about: createBaseSchema().extend({
        reverse: z.boolean().optional(),
        orientation: z.enum(orientationEnum).optional(),
        icon: z.string().optional(),
        summary: z.array(z.string()).optional(),
        image: createImageSchema().optional(),
        video: createVideoSchema().optional()
      }).optional(),
      connect: createBaseSchema().extend({
        reverse: z.boolean().optional(),
        orientation: z.enum(orientationEnum).optional(),
        icon: z.string().optional(),
        discordWidgetId: z.string().optional()
      }).optional()
    })
  }),
  docs: defineCollection({
    type: 'page',
    source: '1.docs/**/*'
  }),
  download: defineCollection({
    type: 'page',
    source: '2.download.yml',
    schema: z.object({
      download: createBaseSchema().extend({
        reverse: z.boolean().optional(),
        orientation: z.enum(orientationEnum).optional(),
        icon: z.string().optional(),
        items: z.array(createDownloadPlatformSchema()).optional()
      }).optional()
    })
  }),
  projects: defineCollection({
    type: 'page',
    source: '3.projects.yml',
    schema: z.object({
      projects: createBaseSchema().extend({
        reverse: z.boolean().optional(),
        orientation: z.enum(orientationEnum).optional(),
        icon: z.string().optional(),
        itemsToShow: z.number().optional(),
        sortBy: z.enum(['name', 'updated', 'stars', 'forks']).optional(),
        featured: z.array(z.string()).optional()
      }).optional()
    })
  }),
  blog: defineCollection({
    type: 'page',
    source: '4.blog.yml',
    schema: z.object({})
  }),
  posts: defineCollection({
    type: 'page',
    source: '4.blog/**/*',
    schema: z.object({
      icon: z.string().optional(),
      image: z.object({ src: z.string().nonempty().editor({ input: 'media' }) }),
      authors: z.array(
        z.object({
          name: z.string().nonempty(),
          to: z.string().nonempty(),
          avatar: z.object({ src: z.string().nonempty().editor({ input: 'media' }) })
        })
      ),
      date: z.date(),
      badge: z.object({ label: z.string().nonempty() })
    })
  })
}

export default defineContentConfig({
  collections
})
