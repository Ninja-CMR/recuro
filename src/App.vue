<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/services/supabase'

const authStore = useAuthStore()

onMounted(() => {
  authStore.fetchUser()
  
  // Listen for auth changes globally
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event)
    if (session?.user) {
      authStore.user = session.user
    } else {
      authStore.user = null
    }
  })
})
</script>

<template>
  <RouterView />
</template>

<style>
/* Global styles are handled in style.css */
</style>
