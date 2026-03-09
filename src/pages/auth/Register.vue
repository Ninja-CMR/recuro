<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Card from '@/components/ui/Card.vue'

import { useRegisterValidation } from '@/composables/useAuthValidation'
import { CheckCircle2 } from 'lucide-vue-next'

const router = useRouter()
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
    error.value = err.message || 'Une erreur est survenue'
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
        <div class="flex justify-center mb-2">
          <img src="/logo.png" alt="Recuro Logo" class="w-16 h-16 object-contain" />
        </div>
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

    <!-- Success Modal Overlay -->
    <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <Card class="w-full max-w-md p-8 text-center space-y-6 shadow-2xl border-primary/20 animate-in fade-in zoom-in duration-300">
        <div class="flex justify-center">
          <div class="bg-primary/10 p-4 rounded-full">
            <CheckCircle2 class="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <div class="space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Compte créé avec succès !</h2>
          <p class="text-muted-foreground">
            Nous sommes ravis de vous accueillir. Un email de confirmation vous a été envoyé pour finaliser votre inscription.
          </p>
        </div>

        <div class="bg-muted/50 p-4 rounded-lg text-sm text-left border border-muted">
          <p class="font-medium mb-1">Prochaines étapes :</p>
          <ul class="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Vérifiez votre boîte de réception</li>
            <li>Cliquez sur le lien de confirmation</li>
            <li>Connectez-vous à votre tableau de bord</li>
          </ul>
        </div>

        <Button class="w-full h-12 text-lg font-semibold" @click="handleFinish">
          Aller à la page de connexion
        </Button>
      </Card>
    </div>
  </div>
</template>
