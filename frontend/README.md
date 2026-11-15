# Placement Management Portal

React and Vite frontend for the placement management backend.

## Connect a Render backend

Configure `VITE_API_BASE_URL` in the Netlify project's environment variables for the deploy contexts you use. Set it to your Render backend's public HTTPS service URL. Both the service origin and the full API URL ending in `/api` are supported. A custom API path is preserved when supplied.

All API requests use this setting, including authentication, students, companies, placement drives, applications, resume uploads, and notifications.

Redeploy the frontend after changing the variable: Vite embeds it at build time. This is a public URL, so do not put passwords, API keys, or other secrets in it.

On the Render backend, allow `https://placementmanagementportal.netlify.app` in its CORS configuration, along with any preview or local frontend origins you use. Permit the API's HTTP methods and the `Authorization` and `Content-Type` request headers. The frontend sends the existing JWT as a Bearer token.

To check the connection after deployment, use the login page and inspect the browser Network tab. API requests should target your Render service under `/api`. A CORS error requires updating the Render backend's allowed origins; a 404 usually means the API base path differs from the backend routes.

## Local development

Copy `.env.example` to `.env.local` and configure the backend URL. Without a configured URL, the frontend uses the local backend on port 5000 under `/api`.

Install dependencies with `npm install` and start the frontend with `npm run dev`. Restart the development server after changing environment variables.
