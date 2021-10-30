// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import { resolve } from "path"
import { on, register, Logger, toPath } from "zerva"
import { useViteMiddleware } from "./vite"

const name = "vite"
const log = Logger(`zerva:${name}`)

interface Config {
  root: string
  www?: string
}

export function useVite(config: Config) {
  log.info(`use ${name} ${process.env.ZERVA}`)
  register(name, ["http"])

  const { root, www = "./www" } = config
  const rootPath = toPath(root)
  const wwwPath = toPath(www)

  on("httpWillStart", async ({ addStatic, app }) => {
    if (
      process.env.ZERVA_DEVELOPMENT ||
      process.env.ZERVA_VITE ||
      process.env.NODE_MODE === "development"
    ) {
      log.info(`serving through vite from ${rootPath}`)
      await useViteMiddleware(rootPath, app)
      return
    }

    log.info(`serving static files at ${wwwPath}}`)
    addStatic("", wwwPath)

    // Map dynamic routes to index.html
    app?.get(/.*/, (req: any, res: any) => {
      log("req.path", req.path)
      res.sendFile(resolve(wwwPath, "index.html"))
    })
  })
}
