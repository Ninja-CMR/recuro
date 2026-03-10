<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Card from '@/components/ui/Card.vue'

import { useRegisterValidation } from '@/composables/useAuthValidation'
import { CheckCircle2 } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()
const loading = ref(false)
const error = ref('')
const showSuccessModal = ref(false)

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

    showSuccessModal.value = true
  } catch (err: any) {
    error.value = err.message || t('auth.err_general')
  } finally {
    loading.value = false
  }
})

const handleFinish = () => {
  showSuccessModal.value = false
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-muted/50 px-4">
    <Card class="w-full max-w-sm p-6 space-y-6">
      <div class="space-y-4 text-center">
        <div class="flex justify-center mb-6">
          <img src="/logo.svg" alt="Recuro Logo" class="h-14 w-auto object-contain" />
        </div>
        <h1 class="text-2xl font-bold tracking-tight">{{ t('auth.register_title') }}</h1>
        <p class="text-sm text-muted-foreground">{{ t('auth.register_subtitle') }}</p>
      </div>
      <form @submit.prevent="handleRegister" class="space-y-4">
        <Input v-model="fullName" v-bind="fullNameProps" :label="t('auth.fullname_label')" :placeholder="t('auth.fullname_placeholder')" :error="errors.fullName" />
        <Input v-model="email" v-bind="emailProps" :label="t('auth.email_label')" type="email" :placeholder="t('auth.email_placeholder')" :error="errors.email" />
        <Input v-model="password" v-bind="passwordProps" :label="t('auth.password_label')" type="password" :error="errors.password" />
        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
        <Button class="w-full" :disabled="loading" type="submit">
          {{ loading ? t('auth.register_loading') : t('auth.register_button') }}
        </Button>
      </form>

      <div class="text-center text-sm">
        {{ t('auth.has_account') }} <router-link to="/login" class="underline hover:text-primary">{{ t('auth.login_title') }}</router-link>
      </div>
    </Card>

    <!-- Success Modal Overlay -->
    <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <Card class="w-full max-w-md p-8 text-center space-y-6 shadow-2xl border-primary/20 animate-in fade-in zoom-in duration-300">
        <div class="flex justify-center">
          <div class="bg-primary/10 p-4 rounded-full">
            <CheckCircle2 class="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <div class="space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">{{ t('auth.success_title') }}</h2>
          <p class="text-muted-foreground">
            {{ t('auth.success_desc') }}
          </p>
        </div>

        <div class="bg-muted/50 p-4 rounded-lg text-sm text-left border border-muted">
          <p class="font-medium mb-1">{{ t('auth.next_steps') }}</p>
          <ul class="list-disc list-inside space-y-1 text-muted-foreground">
            <li>{{ t('auth.step_1') }}</li>
            <li>{{ t('auth.step_2') }}</li>
            <li>{{ t('auth.step_3') }}</li>
          </ul>
        </div>

        <Button class="w-full h-12 text-lg font-semibold" @click="handleFinish">
          {{ t('auth.go_to_login') }}
        </Button>
      </Card>
    </div>
  </div>
</template>
