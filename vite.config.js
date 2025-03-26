import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    extensions: ['.js', '.glsl']
  },
  // Replace module rules with Vite-specific plugin
  plugins: [
    {
      name: 'vite-plugin-glsl',
      transform(code, id) {
        if (id.endsWith('.glsl')) {
          return {
            code: `export default ${JSON.stringify(code)}`,
            map: null
          };
        }
      }
    }
  ]
});