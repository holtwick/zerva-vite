// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import { resolve } from "path"
import { on, register, Logger, toPath } from "zerva"

const name = "vite"
const log = Logger(`zerva:${name}`)

interface Config {
  root: string
  www?: string
}

export function useVite(config: Config) {
  log.info(`use ${name} ${process.env.ZERVA}`)
  register(name, ["http"])

  if (process.env.ZERVA_VERSION == null) {
    log.error("development server must be startet through zerva tool")
    return
  }

  const { root, www = "./www" } = config
  const rootPath = toPath(root)
  const wwwPath = toPath(www)

  on("httpWillStart", async ({ addStatic, app }) => {
    if (process.env.ZERVA_DEVELOPMENT) {
      log.info(`serving through vite from ${rootPath}`)

      // Create Vite server in middleware mode.
      const { createServer } = await import("vite")
      const vite = await createServer({
        root: rootPath,
        server: {
          middlewareMode: "html",
        },
      })
      app?.use(vite.middlewares)
    }
    if (process.env.ZERVA_PRODUCTION) {
      log.info(`serving static files at ${wwwPath}}`)
      addStatic("", wwwPath)

      // Map dynamic routes to index.html
      app?.get(/.*/, (req: any, res: any) => {
        log("req.path", req.path)
        res.sendFile(resolve(wwwPath, "index.html"))
      })
    }
  })
}
