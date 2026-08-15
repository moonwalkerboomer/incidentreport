# Intergalactic Incident Report Generator

A browser-only React and TypeScript incident report generator. It uses the Canvas API to render user-entered text over the report artwork and download the result as a PNG.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The included GitHub Actions workflow publishes the `dist` directory to GitHub Pages whenever `main` is updated.
