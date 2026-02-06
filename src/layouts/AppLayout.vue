<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import MobileNav from '@/components/layout/MobileNav.vue'
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Desktop Sidebar -->
    <AppSidebar />

    <!-- Main Content -->
    <main class="md:pl-64 min-h-screen pb-20 md:pb-0 transition-all duration-300">
      <div class="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <RouterView />
      </div>
    </main>

    <!-- Mobile Navigation -->
    <MobileNav />
  </div>
</template>
