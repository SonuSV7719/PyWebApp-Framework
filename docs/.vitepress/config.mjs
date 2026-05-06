import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid({
  title: "PyWebApp Native v2.3.0",
  description: "High-Performance Cross-Platform Framework",
  base: '/PyWebApp-Framework/',
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', rel: 'stylesheet' }],
  ],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Framework Docs', link: '/guide/architecture' },
      { text: 'Build an App', link: '/guide/tutorial' }
    ],
    sidebar: [
      {
        text: '🏗️ The Framework (Pip)',
        items: [
          { text: 'Prerequisites', link: '/guide/prerequisites' },
          { text: 'Core Architecture', link: '/guide/architecture' },
          { text: 'App Configuration', link: '/guide/configuration' },
          { text: 'GitHub Setup', link: '/guide/github-setup' },
          { text: 'CLI Reference', link: '/guide/cli' },
          { text: 'Universal Bridge', link: '/api/' },
          { text: 'Advanced Internals', link: '/advanced/' },
          { text: 'Licensing', link: '/guide/licensing' }
        ]
      },
      {
        text: '🚀 Build Your First App',
        items: [
          { text: 'Getting Started', link: '/guide/tutorial' },
          { text: 'Modular Architecture', link: '/guide/tutorial2' },
          { text: 'Scaling Your App', link: '/guide/scaling' },
          { text: 'App: Calculation App', link: '/guide/calculation-tutorial' },
          { text: 'Mastering Permissions', link: '/guide/permissions' },
          { text: 'Mobile Routing', link: '/guide/routing' },
          { text: 'Android Build', link: '/platforms/android' },
          { text: 'Desktop Build', link: '/platforms/desktop' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/SonuSV7719/PyWebApp-Framework' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Sonu Vishwakarma'
    },
    search: {
      provider: 'local'
    }
  },
  mermaid: {
    theme: 'dark'
  }
})
