<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { LayoutDashboard, Users, FileText, Repeat, Settings, LogOut, Globe } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { locale, t } = useI18n()

const navItems = computed(() => [
  { name: t('nav.dashboard'), path: '/dashboard', icon: LayoutDashboard },
  { name: t('nav.clients'), path: '/clients', icon: Users },
  { name: t('nav.invoices'), path: '/invoices', icon: FileText },
  { name: t('nav.subscriptions'), path: '/subscriptions', icon: Repeat },
  { name: t('nav.settings'), path: '/settings', icon: Settings },
])

const isActive = (path: string) => route.path.startsWith(path)

const handleLogout = async () => {
  await authStore.signOut()
  router.push('/login')
}
</script>

<template>
  <aside class="w-64 border-r border-border bg-card hidden md:flex flex-col h-screen fixed left-0 top-0 z-30">
    <div class="h-16 flex items-center px-4 border-b border-border">
      <img src="/logo.svg" alt="Recuro Logo" class="h-10 w-auto object-contain" />
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

    <div class="p-4 border-t border-border flex flex-col gap-4 mt-auto">
      <div class="flex items-center gap-2 px-3 text-muted-foreground w-full">
        <Globe class="w-4 h-4" />
        <select v-model="locale" class="bg-transparent border-none outline-none focus:ring-0 text-sm cursor-pointer w-full appearance-none font-medium hover:text-foreground transition-colors">
          <option value="fr">Français 🇫🇷</option>
          <option value="en">English 🇬🇧</option>
          <option value="ja">日本語 🇯🇵</option>
        </select>
      </div>

      <div class="flex items-center gap-3 px-3 py-2 bg-accent/50 rounded-lg">
        <div class="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border">
          <span class="text-xs font-bold">{{ authStore.userProfile?.initials || 'U' }}</span>
        </div>
        <div class="flex-1 overflow-hidden">
          <p class="text-sm font-medium truncate">{{ authStore.userProfile?.full_name || t('nav.user') }}</p>
          <p class="text-xs text-muted-foreground truncate">{{ authStore.userProfile?.email || '' }}</p>
        </div>
        <button @click="handleLogout" class="text-muted-foreground hover:text-destructive transition-colors" :title="t('nav.logout')">
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </div>
  </aside>
</template>
