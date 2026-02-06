<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background text-foreground font-sans">
    <header class="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-14 items-center justify-between">
        <div class="mr-4 flex">
          <a class="mr-6 flex items-center space-x-2 font-bold" href="/">
            Recuro
          </a>
        </div>
        <div class="flex items-center space-x-2">
          <router-link to="/login" class="text-sm font-medium transition-colors hover:text-primary">Login</router-link>
          <router-link to="/register" class="text-sm font-medium transition-colors hover:text-primary bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90">Get Started</router-link>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <RouterView />
    </main>

    <footer class="border-t py-6 md:py-0">
      <div class="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p class="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built by Recuro Inc.
        </p>
      </div>
    </footer>
  </div>
</template>
