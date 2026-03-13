<script setup lang="ts">
import { useRouter } from 'vue-router'
import { LogOut, Globe } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const authStore = useAuthStore()
const { locale, t } = useI18n()

const handleLogout = async () => {
  await authStore.signOut()
  router.push('/login')
}
</script>

<template>
  <header class="md:hidden h-16 bg-card border-b border-border flex items-center justify-between px-4 sticky top-0 z-30">
    <div class="flex items-center gap-2">
      <img src="/logo.svg" alt="Recuro Logo" class="h-8 w-auto object-contain" />
    </div>

    <div class="flex items-center gap-4">
      <div class="flex items-center gap-1 text-muted-foreground">
        <Globe class="w-4 h-4" />
        <select v-model="locale" class="bg-transparent border-none outline-none focus:ring-0 text-xs cursor-pointer appearance-none font-medium hover:text-foreground transition-colors">
          <option value="fr">FR</option>
          <option value="en">EN</option>
          <option value="ja">JP</option>
        </select>
      </div>

      <button @click="handleLogout" class="p-2 text-muted-foreground hover:text-destructive transition-colors" :title="t('nav.logout')">
        <LogOut class="w-5 h-5" />
      </button>
    </div>
  </header>
</template>
