<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Card from '@/components/ui/Card.vue'

import { useLoginValidation } from '@/composables/useAuthValidation'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')

const { errors, email, emailProps, password, passwordProps, handleSubmit } = useLoginValidation()

const handleLogin = handleSubmit(async (values) => {
  loading.value = true
  error.value = ''
  
  try {
    const { error: err } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    })

    if (err) throw err
    
    await authStore.fetchUser()
    router.push('/dashboard')
    } catch (err: any) {
      error.value = err.message || 'Erreur de connexion'
    } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-muted/50 px-4">
    <Card class="w-full max-w-sm p-6 space-y-6">
      <div class="space-y-2 text-center">
        <h1 class="text-2xl font-bold tracking-tight">Connexion</h1>
        <p class="text-sm text-muted-foreground">Entrez vos identifiants pour accéder à Recuro</p>
      </div>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <Input v-model="email" v-bind="emailProps" label="Email" type="email" placeholder="john@example.com" :error="errors.email" />
        <Input v-model="password" v-bind="passwordProps" label="Mot de passe" type="password" :error="errors.password" />
        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
        <Button class="w-full" :disabled="loading" type="submit">
          {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
        </Button>
      </form>
      <div class="text-center text-sm">
        Pas encore de compte ? <router-link to="/register" class="underline hover:text-primary">Créer un compte</router-link>
      </div>
    </Card>
  </div>
</template>
