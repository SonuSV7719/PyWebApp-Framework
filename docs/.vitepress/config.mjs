import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "PyWebApp Native",
  description: "High-Performance Cross-Platform Framework",
  base: '/PyWebApp-Framework/', // Match your GitHub repo name
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/android' },
      { text: 'Pip Package', link: 'https://pypi.org/project/pywebapp-native/' }
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Quick Start', link: '/' },
          { text: 'Architecture', link: '/guide/architecture' }
        ]
      },
      {
        text: 'Platform Guides',
        items: [
          { text: 'Android (APK)', link: '/platforms/android' },
          { text: 'Desktop (EXE)', link: '/platforms/desktop' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'API Docs', link: '/api/' },
          { text: 'Advanced Usage', link: '/advanced/' }
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
