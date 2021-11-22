// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import { existsSync, readFileSync } from "fs"
import { resolve } from "path"
import { on, register, Logger, toPath, valueToBoolean } from "zerva"
import { createServer } from "vite"
// import { render } from "./src/entry-server"

const name = "vite"
const log = Logger(`zerva:${name}`)

interface Config {
  root: string
  ssr?: boolean
  www?: string
  template?: string
}

export function useViteSsr(config: Config) {
  log.info(`use ${name} ${process.env.ZERVA}`)
  register(name, ["http"])

  const { root, www = "./www", ssr = false, template } = config
  const rootPath = toPath(root)
  const wwwPath = toPath(www)

  const isDevMode = !(
    valueToBoolean(process.env.ZERVA_PRODUCTION) ||
    process.env.NODE_MODE === "production"
  )

  on("httpWillStart", async ({ addStatic, app }) => {
    log.info(`isDevMode=${isDevMode}`)
    log.info(`serving through vite from ${rootPath}`)

    if (isDevMode) {
      const vite = await createServer({
        root: rootPath,
        server: {
          middlewareMode: "ssr",
        },
      })
      app?.use(vite.middlewares)
      app?.use("*", async (req, res) => {
        const url = req.originalUrl
        log(`handle ${url}`)

        try {
          let template = readFileSync(resolve("index.html"), "utf-8")
          template = await vite.transformIndexHtml(url, template)
          const { render } = await vite.ssrLoadModule("/src/entry-server.ts")
          const appHtml = await render(url, {})
          const html = template.replace(/<.*?id="app".*?>.*?<\//gi, (m) =>
            m.replace("</", appHtml + "</")
          )
          res.status(200).set({ "Content-Type": "text/html" }).end(html)
        } catch (e: any) {
          vite.ssrFixStacktrace(e)
          log.error(e)
          res.status(500).end(e.message)
        }
      })
    } else {
      app.use(require("compression")())
      app.use(
        require("serve-static")(resolve("dist/client"), {
          index: false,
        })
      )
      // addStatic("/assets", resolve("./dist/client/assets"))

      const template = readFileSync(resolve("dist/client/index.html"), "utf-8")
      const manifest = require("./dist/client/ssr-manifest.json")

      app?.use("*", async (req, res) => {
        const url = req.originalUrl
        log(`prod handle ${url}`)

        try {
          const { render } = require("./dist/server/entry-server")
          const appHtml = await render(url, manifest)
          const html = template.replace(/<.*?id="app".*?>.*?<\//gi, (m) =>
            m.replace("</", appHtml + "</")
          )
          res.status(200).set({ "Content-Type": "text/html" }).end(html)
        } catch (e: any) {
          log.error(e)
          res.status(500).end(e.message)
        }
      })
    }
  })
}
