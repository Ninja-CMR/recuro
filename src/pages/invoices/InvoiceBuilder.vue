<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router' // Import useRoute
import { useClientStore } from '@/stores/client'
import { useInvoiceStore } from '@/stores/invoice'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Card from '@/components/ui/Card.vue'
import { Trash2, Plus, FileDown } from 'lucide-vue-next' // Add FileDown icon
import { generatePdf } from '@/services/pdfService' // Import generatePdf

import { useInvoiceValidation } from '@/composables/useInvoiceValidation'

const router = useRouter()
const route = useRoute()
const clientStore = useClientStore()
const invoiceStore = useInvoiceStore()
const saving = ref(false)
const currentInvoice = ref<any>(null) // To store the fetched invoice data for PDF generation

const invoiceId = computed(() => route.params.id as string | undefined)
const isEditMode = computed(() => !!invoiceId.value)

const {
  errors,
  values,
  clientId, clientIdProps,
  issueDate, issueDateProps,
  dueDate, dueDateProps,
  fields: items,
  push: addItem,
  remove: removeItem,
  handleSubmit,
  setValues
} = useInvoiceValidation()

onMounted(async () => {
  await clientStore.fetchClients()

  if (isEditMode.value && invoiceId.value) {
    const { data: invoiceData, error: fetchError } = await invoiceStore.fetchInvoiceById(invoiceId.value)
    if (fetchError) {
      alert('Erreur lors du chargement de la facture: ' + fetchError)
      router.push('/invoices')
      return
    }

    if (invoiceData) {
      currentInvoice.value = invoiceData // Store the fetched invoice
      setValues({
        clientId: invoiceData.client_id,
        issueDate: invoiceData.issue_date,
        dueDate: invoiceData.due_date,
        items: invoiceData.invoice_items || []
      })
    }
  }
})

const itemTotal = (item: any) => {
  return (item.value.quantity || 0) * (item.value.unit_price || 0)
}

const totalAmount = computed(() => {
  return values.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
})

const handleSave = handleSubmit(async (formValues) => {
  saving.value = true
  let error = null
  let resultInvoice = null

  const invoicePayload: any = {
    client_id: formValues.clientId,
    issue_date: formValues.issueDate,
    due_date: formValues.dueDate,
    total_amount: totalAmount.value,
    status: 'sent'
  }

  if (isEditMode.value && invoiceId.value) {
    const { data, error: updateError } = await invoiceStore.updateInvoice(invoiceId.value, invoicePayload, formValues.items)
    error = updateError
    resultInvoice = data
  } else {
    const { data, error: createError } = await invoiceStore.createInvoice(invoicePayload, formValues.items)
    error = createError
    resultInvoice = data
  }

  saving.value = false
  
  if (!error) {
    // Update currentInvoice after save for PDF generation
    if (resultInvoice) {
        currentInvoice.value = { 
            ...resultInvoice, 
            invoice_items: formValues.items,
            client: clientStore.clients.find(c => c.id === formValues.clientId) // Add client info
        }
    }
    router.push(`/invoices/${resultInvoice?.id || invoiceId.value}`)
  } else {
    alert('Erreur: ' + error)
  }
})

const handleDownloadPdf = () => {
  if (currentInvoice.value) {
    generatePdf(currentInvoice.value)
  } else {
    alert('Aucune facture à télécharger. Enregistrez la facture d\'abord.')
  }
}
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">
        {{ isEditMode ? 'Modifier Facture' : 'Nouvelle Facture' }}
      </h1>
      <Button v-if="isEditMode && currentInvoice" @click="handleDownloadPdf" variant="outline">
        <FileDown class="w-4 h-4 mr-2" />
        Télécharger PDF
      </Button>
    </div>

    <div class="grid gap-6 md:grid-cols-3">
      <!-- Invoice Settings -->
      <Card class="md:col-span-1 p-6 space-y-4 h-fit">
        <div>
          <label class="block text-sm font-medium mb-1">Client</label>
          <select 
            v-model="clientId" 
            v-bind="clientIdProps"
            class="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            :class="{ 'border-destructive': errors.clientId }"
          >
            <option value="" disabled>Choisir un client...</option>
            <option v-for="client in clientStore.clients" :key="client.id" :value="client.id">
              {{ client.name }}
            </option>
          </select>
          <p v-if="errors.clientId" class="text-xs text-destructive mt-1">{{ errors.clientId }}</p>
          <p v-if="clientStore.clients.length === 0" class="text-xs text-muted-foreground mt-1">
            <router-link to="/clients" class="underline">Créer un client d'abord</router-link>
          </p>
        </div>
        <Input v-model="issueDate" v-bind="issueDateProps" type="date" label="Date d'émission" :error="errors.issueDate" />
        <Input v-model="dueDate" v-bind="dueDateProps" type="date" label="Date d'échéance" :error="errors.dueDate" />
      </Card>

      <!-- Invoice Items -->
      <Card class="md:col-span-2 p-6 space-y-6">
        <div class="space-y-4">
          <div v-for="(item, index) in items" :key="item.key" class="flex gap-2 items-end group">
            <div class="flex-1">
              <Input v-model="item.value.description" placeholder="Description du service" :label="index === 0 ? 'Description' : ''" :error="errors[`items[${index}].description`]" />
            </div>
            <div class="w-20">
              <Input v-model.number="item.value.quantity" type="number" placeholder="1" :label="index === 0 ? 'Qté' : ''" :error="errors[`items[${index}].quantity`]" />
            </div>
            <div class="w-24">
              <Input v-model.number="item.value.unit_price" type="number" placeholder="0" :label="index === 0 ? 'Prix.U' : ''" :error="errors[`items[${index}].unit_price`]" />
            </div>
            <div class="w-24 pb-2 text-right font-medium text-sm">
              {{ itemTotal(item).toFixed(2) }} €
            </div>
            <div class="pb-1">
              <Button variant="ghost" size="icon" @click="removeItem(index)" class="text-destructive hover:bg-destructive/10">
                <Trash2 class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <Button variant="outline" @click="addItem({ description: '', quantity: 1, unit_price: 0 })" class="w-full border-dashed">
          <Plus class="w-4 h-4 mr-2" /> Ajouter une ligne
        </Button>

        <div class="border-t pt-4 flex justify-end items-center gap-4">
            <div class="text-right">
                <span class="text-muted-foreground">Total</span>
                <p class="text-2xl font-bold">{{ totalAmount.toFixed(2) }} €</p>
            </div>
        </div>
        
        <div class="flex justify-end gap-3 pt-4">
            <Button variant="secondary" @click="router.back()">Annuler</Button>
            <Button @click="handleSave" :disabled="saving">
                {{ saving ? 'Enregistrement...' : 'Créer et Envoyer' }}
            </Button>
        </div>
      </Card>
    </div>
  </div>
</template>
