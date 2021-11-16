// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import { existsSync, readFileSync } from "fs"
import { resolve } from "path"
import { on, register, Logger, toPath } from "zerva"
import { createServer } from "vite"

const name = "vite"
const log = Logger(`zerva:${name}`)

interface Config {
  root: string
  ssr?: boolean
  www?: string
  // server?: ServerOptions
}

export function useVite(config: Config) {
  log.info(`use ${name} ${process.env.ZERVA}`)
  register(name, ["http"])

  const { root, www = "./www", ssr = false } = config
  const rootPath = toPath(root)
  const wwwPath = toPath(www)

  const isDevMode =
    process.env.ZERVA_DEVELOPMENT ||
    process.env.ZERVA_VITE ||
    process.env.NODE_MODE === "development"

  if (isDevMode) {
    if (!existsSync(rootPath)) {
      log.error(`vite project does not exist at ${rootPath}`)
    }
  } else {
    if (!existsSync(wwwPath)) {
      log.error(`web files do not exist at ${wwwPath}`)
    }
  }

  on("httpWillStart", async ({ addStatic, app }) => {
    if (isDevMode || ssr) {
      log.info(`serving through vite from ${rootPath}`)

      const vite = await createServer({
        root: rootPath,
        server: {
          middlewareMode: ssr ? "ssr" : "html",
        },
      })
      app?.use(vite.middlewares)

      if (ssr) {
        app?.use("*", async (req, res) => {
          const url = req.originalUrl

          try {
            // 1. Read index.html
            let template = readFileSync(
              resolve(__dirname, "index.html"),
              "utf-8"
            )

            // 2. Apply Vite HTML transforms. This injects the Vite HMR client, and
            //    also applies HTML transforms from Vite plugins, e.g. global preambles
            //    from @vitejs/plugin-react-refresh
            template = await vite.transformIndexHtml(url, template)

            // 3. Load the server entry. vite.ssrLoadModule automatically transforms
            //    your ESM source code to be usable in Node.js! There is no bundling
            //    required, and provides efficient invalidation similar to HMR.
            const { render } = await vite.ssrLoadModule("/src/entry-server.ts")

            // 4. render the app HTML. This assumes entry-server.js's exported `render`
            //    function calls appropriate framework SSR APIs,
            //    e.g. ReactDOMServer.renderToString()
            const appHtml = await render(url)

            // 5. Inject the app-rendered HTML into the template.
            const html = template.replace(`<!--ssr-outlet-->`, appHtml)

            // 6. Send the rendered HTML back.
            res.status(200).set({ "Content-Type": "text/html" }).end(html)
          } catch (e: any) {
            // If an error is caught, let Vite fix the stracktrace so it maps back to
            // your actual source code.
            vite.ssrFixStacktrace(e)
            console.error(e)
            res.status(500).end(e.message)
          }
        })
      } else {
        log.info(`serving static files at ${wwwPath}}`)
        addStatic("", wwwPath)

        // Map dynamic routes to index.html
        app?.get(/.*/, (req: any, res: any) => {
          log("req.path", req.path)
          res.sendFile(resolve(wwwPath, "index.html"))
        })
      }
    }
  })
}
