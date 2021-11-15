// Create Vite server in middleware mode.
import { createServer, ServerOptions } from "vite"

export async function useViteMiddleware(
  rootPath: string,
  app: any,
  server?: ServerOptions
) {
  const vite = await createServer({
    root: rootPath,
    server: server ?? {
      middlewareMode: "html",
    },
  })
  app?.use(vite.middlewares)
}
