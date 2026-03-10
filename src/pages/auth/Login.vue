<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Card from '@/components/ui/Card.vue'

import { useLoginValidation } from '@/composables/useAuthValidation'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()
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
      error.value = err.message || t('auth.err_login')
    } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-muted/50 px-4">
    <Card class="w-full max-w-sm p-6 space-y-6">
      <div class="space-y-4 text-center">
        <div class="flex justify-center mb-6">
          <img src="/logo.svg" alt="Recuro Logo" class="h-14 w-auto object-contain" />
        </div>
        <h1 class="text-2xl font-bold tracking-tight">{{ t('auth.login_title') }}</h1>
        <p class="text-sm text-muted-foreground">{{ t('auth.login_subtitle') }}</p>
      </div>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <Input v-model="email" v-bind="emailProps" :label="t('auth.email_label')" type="email" :placeholder="t('auth.email_placeholder')" :error="errors.email" />
        <Input v-model="password" v-bind="passwordProps" :label="t('auth.password_label')" type="password" :error="errors.password" />
        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
        <Button class="w-full" :disabled="loading" type="submit">
          {{ loading ? t('auth.login_loading') : t('auth.login_button') }}
        </Button>
      </form>
      <div class="text-center text-sm">
        {{ t('auth.no_account') }} <router-link to="/register" class="underline hover:text-primary">{{ t('auth.create_account') }}</router-link>
      </div>
    </Card>
  </div>
</template>
