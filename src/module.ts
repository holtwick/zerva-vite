// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import { resolve } from "path"
import { Logger, toPath } from "zeed"
import { on, register } from "zerva"

const name = "vite"
const log = Logger(`zerva:${name}`)

interface Config {
  root: string
  www?: string
}

export function useVite(config: Config) {
  log.info(`use ${name}`)
  register(name)

  const { root, www = toPath("./www") } = config

  on("httpInit", async ({ addStatic, app }) => {
    log("http")
    if (process.env.MODE === "production") {
      addStatic("", www)

      // Map dynamic routes to index.html
      app?.get(/.*/, (req: any, res: any) => {
        log("req.path", req.path)
        res.sendFile(resolve(www, "index.html"))
      })
    } else {
      // Create Vite server in middleware mode.
      const { createServer } = await import("vite")
      const vite = await createServer({
        root: toPath(root),
        server: {
          middlewareMode: "html",
        },
      })
      app?.use(vite.middlewares)
    }
  })
}
