<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useClientStore } from '@/stores/client'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import { Plus, Trash2, Pencil } from 'lucide-vue-next'
import { watch } from 'vue'

import { useClientValidation } from '@/composables/useClientValidation'
import type { Client } from '@/types'
import { useI18n } from 'vue-i18n'

const clientStore = useClientStore()
const { t } = useI18n()
const showCreateForm = ref(false)
const editingClientId = ref<string | null>(null)

const { 
  errors,
  name, nameProps,
  email, emailProps,
  address, addressProps, 
  phone,
  preferred_method, preferredMethodProps,
  handleSubmit, 
  resetForm,
  setValues
} = useClientValidation()

const phonePrefix = ref('+33')
const rawPhone = ref('')

watch([phonePrefix, rawPhone], () => {
    if (rawPhone.value) {
        const cleanPhone = rawPhone.value.replace(/\D/g, '').replace(/^0+/, '')
        phone.value = `${phonePrefix.value}${cleanPhone}`
    } else {
        phone.value = ''
    }
})

const notification = ref<{ type: 'success' | 'error', message: string } | null>(null)

const setNotification = (type: 'success' | 'error', message: string) => {
  notification.value = { type, message }
  setTimeout(() => {
    notification.value = null
  }, 5000)
}

onMounted(() => {
  clientStore.fetchClients()
})

const startCreate = () => {
    editingClientId.value = null
    resetForm()
    phonePrefix.value = '+33'
    rawPhone.value = ''
    showCreateForm.value = true
}

const startEdit = (client: any) => {
    editingClientId.value = client.id
    
    let p = client.phone || ''
    const knownPrefixes = ['+33', '+1', '+44', '+81', '+237', '+225', '+241', '+242', '+243', '+221', '+228', '+229', '+212', '+213', '+216']
    let foundPrefix = '+33'
    for (const prefix of knownPrefixes) {
        if (p.startsWith(prefix)) {
            foundPrefix = prefix
            p = p.slice(prefix.length)
            break
        }
    }
    phonePrefix.value = foundPrefix
    rawPhone.value = p

    setValues({
      name: client.name,
      email: client.email || '',
      address: client.address || '',
      phone: client.phone || '',
      preferred_method: client.preferred_method || 'email'
    })
    showCreateForm.value = true
}

const onFormSubmit = handleSubmit(async (values) => {
  const isEditing = !!editingClientId.value
  const clientData = values as Partial<Client>
  const action = isEditing
    ? clientStore.updateClient(editingClientId.value!, clientData)
    : clientStore.createClient(clientData)
    
  const { error } = await action
  
  if (!error) {
    showCreateForm.value = false
    resetForm()
    editingClientId.value = null
    setNotification('success', isEditing ? t('clients.success_updated') : t('clients.success_created'))
  } else {
    setNotification('error', t('clients.err_save_failed', { msg: error.message || t('auth.err_general') }))
  }
})

const handleDelete = async (id: string) => {
    if (confirm(t('clients.confirm_delete'))) {
        const { error } = await clientStore.deleteClient(id)
        if (!error) {
          setNotification('success', t('clients.success_deleted'))
        } else {
          setNotification('error', t('clients.err_delete_failed', { msg: error.message }))
        }
    }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">{{ t('clients.title') }}</h1>
      <Button @click="startCreate" v-if="!showCreateForm">
        <Plus class="w-4 h-4 mr-2" />
        {{ t('clients.btn_new') }}
      </Button>
    </div>

    <!-- Notifications -->
    <div v-if="notification" :class="[
      'p-4 rounded-md mb-6 animate-in fade-in slide-in-from-top-2 duration-300',
      notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
    ]">
      {{ notification.message }}
    </div>

    <!-- Create/Edit Client Form -->
    <Card v-if="showCreateForm" class="p-6 bg-muted/30 border-dashed">
      <h3 class="font-medium mb-4">{{ editingClientId ? t('clients.form_title_edit') : t('clients.form_title_add') }}</h3>
      <form @submit="onFormSubmit" class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2">
          <Input v-model="name" v-bind="nameProps" :label="t('clients.lbl_name')" :placeholder="t('clients.ph_name')" :error="errors.name" />
          <Input v-model="email" v-bind="emailProps" :label="t('clients.lbl_email')" type="email" :placeholder="t('clients.ph_email')" :error="errors.email" />
        </div>
        <Input v-model="address" v-bind="addressProps" :label="t('clients.lbl_address')" :placeholder="t('clients.ph_address')" :error="errors.address" />
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
             <label class="text-sm font-medium leading-none">{{ t('clients.lbl_phone') }}</label>
             <div class="flex gap-2">
               <select v-model="phonePrefix" class="w-32 h-10 rounded-md border border-input bg-background px-2 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                 <option value="+33">🇫🇷 +33</option>
                 <option value="+1">🇺🇸/🇨🇦 +1</option>
                 <option value="+44">🇬🇧 +44</option>
                 <option value="+81">🇯🇵 +81</option>
                 <option value="+237">🇨🇲 +237</option>
                 <option value="+225">🇨🇮 +225</option>
                 <option value="+241">🇬🇦 +241</option>
                 <option value="+242">🇨🇬 +242</option>
                 <option value="+243">🇨🇩 +243</option>
                 <option value="+221">🇸🇳 +221</option>
                 <option value="+228">🇹🇬 +228</option>
                 <option value="+229">🇧🇯 +229</option>
                 <option value="+212">🇲🇦 +212</option>
                 <option value="+213">🇩🇿 +213</option>
                 <option value="+216">🇹🇳 +216</option>
               </select>
               <Input v-model="rawPhone" :placeholder="t('clients.ph_phone')" class="flex-1" :error="errors.phone" />
             </div>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium leading-none">{{ t('clients.lbl_method') }}</label>
            <select v-model="preferred_method" v-bind="preferredMethodProps" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp Business</option>
              <option value="iphone">iPhone (iMessage/SMS)</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <Button type="button" variant="ghost" @click="showCreateForm = false">{{ t('clients.btn_cancel') }}</Button>
          <Button type="submit" :disabled="clientStore.loading">
              {{ editingClientId ? t('clients.btn_update') : t('clients.btn_create') }}
          </Button>
        </div>
      </form>
    </Card>

    <!-- Client List -->
    <div v-if="clientStore.loading && clientStore.clients.length === 0" class="text-center py-10 text-muted-foreground">
      {{ t('clients.loading') }}
    </div>

    <div v-else-if="clientStore.clients.length === 0" class="rounded-md border p-12 text-center text-muted-foreground">
      <p class="mb-2">{{ t('clients.empty_title') }}</p>
      <p class="text-sm">{{ t('clients.empty_desc') }}</p>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="client in clientStore.clients" :key="client.id" class="p-6 hover:shadow-md transition-shadow group">
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-bold text-lg">{{ client.name }}</h3>
          <!-- Actions -->
          <div class="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon" 
              class="h-8 w-8 text-muted-foreground hover:text-foreground"
              @click.stop="startEdit(client)"
            >
              <Pencil class="w-3 h-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              class="h-8 w-8 text-destructive hover:text-red-600 hover:bg-red-50"
              @click.stop="handleDelete(client.id)"
            >
              <Trash2 class="w-3 h-3" />
            </Button>
          </div>
        </div>
        <div class="space-y-1 text-sm text-muted-foreground">
          <p v-if="client.email">{{ client.email }}</p>
          <p v-if="client.address">{{ client.address }}</p>
          <p v-if="client.phone">{{ client.phone }}</p>
          <p v-if="client.preferred_method" class="text-xs font-medium mt-1">
            <span class="bg-primary/10 text-primary px-2 py-0.5 rounded">
              {{ client.preferred_method === 'whatsapp' ? 'WhatsApp' : client.preferred_method === 'iphone' ? 'iPhone' : 'Email' }}
            </span>
          </p>
        </div>
      </Card>
    </div>
  </div>
</template>
