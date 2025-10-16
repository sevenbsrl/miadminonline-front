# miadminonline-front

Stack: Vite + React + TypeScript + Tailwind + framer-motion + lucide-react + dayjs.

## Requisitos
- Node 18+

## Scripts
- `npm install` — instala dependencias
- `npm run dev` — entorno de desarrollo
- `npm run build` — build de producción
- `npm run preview` — vista previa del build
- `npm run test` — ejecuta tests con Vitest
- `npm run test:watch` — tests en modo watch

## Configuración
- Variable de entorno: `VITE_API_BASE_URL`. Si no se define, se usará `/api`.
  - Ejemplo `.env.local`:
    
    VITE_API_BASE_URL=https://miadminonline.api

- Endpoints esperados:
  - POST `/auth/login` -> `{ token }`
  - GET  `/providers/search?q=` -> `[{ id, nombre, documento, condicion_iva }]`
  - POST `/purchases` -> `{ ok, id }`
  - GET  `/purchases?from=&to=&proveedorId=`

## UI y accesibilidad
- Atajos:
  - Alt+F — enfoca buscador de proveedor
  - Ctrl+Enter — guardar
  - Esc — limpiar formulario
- Componentes minimalistas con Tailwind, accesibles y responsive.

## Pruebas
- Unit tests: `toNumber` y `buildCSV`.
- Smoke test: `CargaFacturaView` (render + cálculo IVA).

## Notas
- Tailwind habilitado importando `@import "tailwindcss";` en `src/index.css`.
- El token de autenticación se persiste en `localStorage` y se envía como `Authorization: Bearer <token>`.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
