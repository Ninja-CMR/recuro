<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.fetchUser()
})
</script>

<template>
  <RouterView />
</template>

<style>
/* Global styles are handled in style.css */
</style>
