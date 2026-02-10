import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input: './src/api/openapi.json',
    output: {
      target: './src/api/generated/api.ts',
      client: 'fetch',
      mode: 'tags-split',
      schemas: './src/api/generated/models',
      mock: false,
      baseUrl: {
        getBaseUrlFromSpecification: true,
      },
    },
  },
})
