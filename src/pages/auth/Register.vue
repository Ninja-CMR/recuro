<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Card from '@/components/ui/Card.vue'

import { useRegisterValidation } from '@/composables/useAuthValidation'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const { errors, fullName, fullNameProps, email, emailProps, password, passwordProps, handleSubmit } = useRegisterValidation()

const handleRegister = handleSubmit(async (values) => {
  loading.value = true
  error.value = ''
  
  try {
    const { error: err } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName
        }
      }
    })

    if (err) throw err

    alert('Compte créé ! Veuillez vérifier vos emails.')
    router.push('/login')
  } catch (err: any) {
    if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('placeholder'))) {
      console.warn('Mode démo: Auth simulée suite à erreur réseau Supabase')
      router.push('/login')
    } else {
      error.value = err.message || 'Une erreur est survenue'
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-muted/50 px-4">
    <Card class="w-full max-w-sm p-6 space-y-6">
      <div class="space-y-2 text-center">
        <h1 class="text-2xl font-bold tracking-tight">Inscription</h1>
        <p class="text-sm text-muted-foreground">Commencez gratuitement avec Recuro</p>
      </div>
      <form @submit.prevent="handleRegister" class="space-y-4">
        <Input v-model="fullName" v-bind="fullNameProps" label="Nom complet" placeholder="John Doe" :error="errors.fullName" />
        <Input v-model="email" v-bind="emailProps" label="Email" type="email" placeholder="john@example.com" :error="errors.email" />
        <Input v-model="password" v-bind="passwordProps" label="Mot de passe" type="password" :error="errors.password" />
        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
        <Button class="w-full" :disabled="loading" type="submit">
          {{ loading ? 'Création en cours...' : "S'inscrire" }}
        </Button>
      </form>
      <div class="text-center text-sm">
        Déjà un compte ? <router-link to="/login" class="underline hover:text-primary">Se connecter</router-link>
      </div>
    </Card>
  </div>
</template>
