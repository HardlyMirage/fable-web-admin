# Fable Admin Web Interface

This is the admin web interface for the Fable platform. It provides a user interface for managing universities, courses, and events.

## Getting Started

### Prerequisites

- Node.js 18+
- API Admin server running (api-admin)
- pnpm

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

Create a `.env` file based on the `.env.example`:

```bash
cp .env.example .env
```

Adjust the values in the `.env` file as needed:
- `VITE_API_URL`: URL of the backend API server

3. Start the development server:

```bash
pnpm run dev
```

The application will be available at `http://localhost:5173`.

## Features

- **Authentication:** Secure login for admin users
- **Universities Management:** Create, read, update, and delete universities
- **Courses Management:** Create, read, update, and delete courses
- **Events Management:** Create, read, update, and delete events
- **Dashboard:** Overview of platform statistics

## Technology Stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios for API requests

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
