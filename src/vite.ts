// Create Vite server in middleware mode.
import { createServer } from "vite"

export async function useViteMiddleware(rootPath: string, app: any) {
  const vite = await createServer({
    root: rootPath,
    server: {
      middlewareMode: "html",
    },
  })
  app?.use(vite.middlewares)
}
