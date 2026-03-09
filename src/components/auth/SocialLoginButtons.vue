<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import Button from '@/components/ui/Button.vue'

const loadingProvider = ref<string | null>(null)

const handleSocialLogin = async (provider: 'google' | 'apple') => {
  loadingProvider.value = provider
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    if (error) throw error
  } catch (err: any) {
    alert(err.message || 'Une erreur est survenue lors de la connexion')
  } finally {
    loadingProvider.value = null
  }
}
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <Button 
      variant="outline" 
      class="w-full" 
      @click="handleSocialLogin('google')"
      :disabled="!!loadingProvider"
    >
      <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Google
    </Button>
    <Button 
      variant="outline" 
      class="w-full" 
      @click="handleSocialLogin('apple')"
      :disabled="!!loadingProvider"
    >
      <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24">
        <path fill="currentColor" d="M17.05 20.28c-.96.95-2.2 2.1-3.6 2.1-.48 0-.88-.12-1.27-.26-.36-.13-.76-.28-1.22-.28s-.86.15-1.22.28c-.39.14-.79.26-1.27.26-1.4 0-2.64-1.14-3.6-2.1C3.3 18.73 1.5 15.52 1.5 12.3c0-3.3 2.13-4.59 3.63-4.59.45 0 .93.1 1.34.25.38.15.75.31 1.15.31.39 0 .76-.16 1.14-.31.42-.16.9-.25 1.35-.25 1.48 0 3.61 1.28 3.61 4.59 0 .4-.03.79-.1 1.18-.32 1.83-1.29 4.88-1.57 6.8zm-4.32-13.9c0-1.27.67-2.5 1.6-3.32.93-.82 2.15-1.23 3.34-1.23.11 1.37-.53 2.62-1.44 3.49-.91.87-2.2 1.39-3.4 1.3.11-.1.1-.17-.1-.24z"/>
      </svg>
      Apple
    </Button>
  </div>
</template>
