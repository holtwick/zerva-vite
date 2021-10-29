# 🌱 Zerva & Vite

**This is a side project of [Zerva](https://github.com/holtwick/zerva)**

Integrate [Vite](https://vitejs.dev/) development server including HMR etc.

Basically it is using the approach [described here](https://vitejs.dev/guide/ssr.html#setting-up-the-dev-server).

Use it like this:

```ts
useVite({
  root: "..",
  www: "./www",
})
```

Where `root` is the path to the Vite project that should be served.

`www` would be the path where the Vite build should go to, to be served by Zerva. These are usually the generated files that land in `dist` but you can change the destination in the `vite.config.ts`via [`build.outDir`](https://vitejs.dev/config/#build-outdir).
