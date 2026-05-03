import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';

export default withMermaid(
  defineConfig({
    title: 'PyWebApp',
    description: 'Cross-platform framework — React frontend + Python backend via IPC',
    
    head: [
      ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
      ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
      ['link', { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', rel: 'stylesheet' }],
    ],

    themeConfig: {
      logo: '⚡',
      
      nav: [
        { text: 'Guide', link: '/guide/getting-started' },
        { text: 'API', link: '/api/registry' },
        { text: 'Platforms', link: '/platforms/desktop' },
        { text: 'Advanced', link: '/advanced/middleware' },
      ],

      sidebar: {
        '/guide/': [
          {
            text: 'Introduction',
            items: [
              { text: 'Getting Started', link: '/guide/getting-started' },
              { text: 'Architecture', link: '/guide/architecture' },
              { text: 'Tutorial: Counter App', link: '/guide/tutorial' },
            ],
          },
          {
            text: 'Development',
            items: [
              { text: 'Adding Methods', link: '/guide/adding-methods' },
              { text: 'Hot Reload', link: '/guide/hot-reload' },
              { text: 'Scaling Your App', link: '/guide/scaling' },
              { text: 'Building & Deployment', link: '/guide/building' },
            ],
          },
        ],
        '/api/': [
          {
            text: 'Python API',
            items: [
              { text: '@register Decorator', link: '/api/registry' },
              { text: 'Dispatcher', link: '/api/dispatcher' },
            ],
          },
          {
            text: 'JavaScript API',
            items: [
              { text: 'bridge.js', link: '/api/bridge-js' },
              { text: 'Native Bridges', link: '/api/bridge-native' },
            ],
          },
        ],
        '/platforms/': [
          {
            text: 'Platforms',
            items: [
              { text: 'Desktop (pywebview)', link: '/platforms/desktop' },
              { text: 'Android (Chaquopy)', link: '/platforms/android' },
              { text: 'Python Packages', link: '/platforms/packages' },
            ],
          },
        ],
        '/advanced/': [
          {
            text: 'Advanced',
            items: [
              { text: 'Middleware', link: '/advanced/middleware' },
              { text: 'Namespaces', link: '/advanced/namespaces' },
              { text: 'Error Handling', link: '/advanced/error-handling' },
              { text: 'Testing', link: '/advanced/testing' },
            ],
          },
        ],
      },

      socialLinks: [
        { icon: 'github', link: 'https://github.com/your-org/pywebapp' },
      ],

      search: {
        provider: 'local',
      },

      footer: {
        message: 'Released under the MIT License.',
        copyright: 'Copyright © 2024 PyWebApp',
      },
    },

    // Mermaid configuration
    mermaid: {
      theme: 'dark',
    },
  })
);
