<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { LayoutDashboard, Users, FileText, Repeat, Settings, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Clients', path: '/clients', icon: Users },
  { name: 'Factures', path: '/invoices', icon: FileText },
  { name: 'Abonnements', path: '/subscriptions', icon: Repeat },
  { name: 'Paramètres', path: '/settings', icon: Settings },
]

const isActive = (path: string) => route.path.startsWith(path)

const handleLogout = async () => {
  await authStore.signOut()
  router.push('/login')
}
</script>

<template>
  <aside class="w-64 border-r border-border bg-card hidden md:flex flex-col h-screen fixed left-0 top-0 z-30">
    <div class="h-16 flex items-center px-6 border-b border-border gap-3">
      <img src="/logo.png" alt="Recuro Logo" class="w-8 h-8 object-contain" />
      <span class="text-xl font-bold tracking-tight">Recuro</span>
    </div>

    <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        :class="isActive(item.path) 
          ? 'bg-primary text-primary-foreground' 
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'"
      >
        <component :is="item.icon" class="w-4 h-4" />
        {{ item.name }}
      </RouterLink>
    </nav>

    <div class="p-4 border-t border-border">
      <div class="flex items-center gap-3 px-3 py-2">
        <div class="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <span class="text-xs font-bold">{{ authStore.userProfile?.initials || 'U' }}</span>
        </div>
        <div class="flex-1 overflow-hidden">
          <p class="text-sm font-medium truncate">{{ authStore.userProfile?.full_name || 'Utilisateur' }}</p>
          <p class="text-xs text-muted-foreground truncate">{{ authStore.userProfile?.email || '' }}</p>
        </div>
        <button @click="handleLogout" class="text-muted-foreground hover:text-foreground transition-colors">
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </div>
  </aside>
</template>
