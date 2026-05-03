import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid({
  title: "PyWebApp Native",
  description: "High-Performance Cross-Platform Framework",
  base: '/PyWebApp-Framework/',
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
          { text: 'Core Architecture', link: '/guide/architecture' },
          { text: 'App Configuration', link: '/guide/configuration' },
          { text: 'GitHub Setup', link: '/guide/github-setup' },
          { text: 'CLI Reference', link: '/guide/cli' },
          { text: 'Universal Bridge', link: '/api/' },
          { text: 'Advanced Internals', link: '/advanced/' }
        ]
      },
      {
        text: '🚀 Build Your First App',
        items: [
          { text: 'Getting Started', link: '/guide/tutorial' },
          { text: 'Scaling Your App', link: '/guide/scaling' },
          { text: 'App: Calculation App', link: '/guide/calculation-tutorial' },
          { text: 'Mastering Permissions', link: '/guide/permissions' },
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
      copyright: 'Copyright © 2026-present Sonu Vishwakarma'
    }
  }
})
