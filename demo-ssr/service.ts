import { serve, useHttp } from "zerva"
import { useViteSsr } from "./use-vite-ssr"

useHttp({
  port: 8080,
})

const template = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <link rel="icon" href="/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vite App</title>
</head>

<body>
  <div id="app"></div>
  <script type="module" src="/src/entry-client.ts"></script>
</body>

</html>`

useViteSsr({
  ssr: true,
  root: ".",
  template,
})

serve()
