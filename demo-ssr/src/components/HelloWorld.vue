<script setup lang="ts">
import { ref } from "vue"
import logo from "../assets/logo.png"
import { ClientOnly } from "./ClientOnly"
const count = ref(0)
</script>

<template>
  <h1>Hello World</h1>

  <client-only> CLIENT ONLY </client-only>

  <p>
    <a href="/sub">Sub Page</a>
  </p>

  <p>
    <router-link to="/sub">Sub Page via Vue</router-link>
  </p>

  <p>
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut tenetur
    accusantium dolorem distinctio, rem asperiores consequatur fugiat laborum
    cumque laudantium ullam quibusdam ad dolor facilis repellendus dolores
    suscipit exercitationem quidem.
  </p>

  <p>See <code>README.md</code> for more information.</p>

  <p>
    <a href="https://vitejs.dev/guide/features.html" target="_blank">
      Vite Docs
    </a>
    |
    <a href="https://v3.vuejs.org/" target="_blank">Vue 3 Docs</a>
  </p>

  <button type="button" @click="count++">count is: {{ count }}</button>
  <p>
    Edit
    <code>components/HelloWorld.vue</code> to test hot module replacement.
  </p>

  <img :src="logo" />
</template>

<style>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
