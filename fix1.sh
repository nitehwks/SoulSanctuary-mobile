# Create the missing server files
cat > server/routes.ts << 'EOF'
import { Express } from 'express';

export async function registerRoutes(app: Express) {
  return app;
}
EOF

cat > server/vite.ts << 'EOF'
import { Express } from 'express';

export async function setupVite(app: Express, server: any) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);
  return server;
}

export function serveStatic(app: Express) {
  app.use(express.static('dist'));
}

export function log(message: string) {
  console.log(message);
}
EOF

# Create vite-env.d.ts
cat > src/vite-env.d.ts << 'EOF'
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_API_URL: string
  readonly VITE_ENCRYPTION_KEY: string
  readonly VITE_OPENROUTER_API_KEY: string
  readonly VITE_APP_URL: string
  readonly VITE_APP_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
EOF

# Run build
npm run build

