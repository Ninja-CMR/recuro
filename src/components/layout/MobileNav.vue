<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { LayoutDashboard, Users, FileText, Repeat, Settings } from 'lucide-vue-next'

const route = useRoute()

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Clients', path: '/clients', icon: Users },
  { name: 'Factures', path: '/invoices', icon: FileText },
  { name: 'Abos', path: '/subscriptions', icon: Repeat },
  { name: 'Paramètres', path: '/settings', icon: Settings },
]

const isActive = (path: string) => route.path.startsWith(path)
</script>

<template>
  <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-30 flex justify-around items-center h-16 px-2 pb-safe">
    <RouterLink
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="flex flex-col items-center justify-center p-2 rounded-md transition-colors w-full"
      :class="isActive(item.path) ? 'text-primary' : 'text-muted-foreground'"
    >
      <component :is="item.icon" class="w-5 h-5 mb-0.5" />
      <span class="text-[10px] font-medium">{{ item.name }}</span>
    </RouterLink>
  </nav>
</template>
