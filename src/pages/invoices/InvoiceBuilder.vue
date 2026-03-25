<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useClientStore } from '@/stores/client'
import { useInvoiceStore } from '@/stores/invoice'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Card from '@/components/ui/Card.vue'
import { Trash2, Plus, FileDown } from 'lucide-vue-next'
import { generatePdf } from '@/services/pdfService'

import { useInvoiceValidation } from '@/composables/useInvoiceValidation'

const router = useRouter()
const route = useRoute()
const clientStore = useClientStore()
const invoiceStore = useInvoiceStore()
const saving = ref(false)
const currentInvoice = ref<any>(null)

const invoiceId = computed(() => route.params.id as string | undefined)
const isEditMode = computed(() => !!invoiceId.value)

const currencies = [
  { value: 'XAF', label: 'Franc CFA (FCFA)', symbol: 'FCFA' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'USD', label: 'Dollar US ($)', symbol: '$' },
  { value: 'JPY', label: 'Yen Japonais (¥)', symbol: '¥' }
]

const {
  errors,
  values,
  clientId, clientIdProps,
  currency, currencyProps,
  issueDate, issueDateProps,
  dueDate, dueDateProps,
  fields: items,
  push: addItem,
  remove: removeItem,
  handleSubmit,
  setValues
} = useInvoiceValidation()

const currentSymbol = computed(() => {
  const cur = currencies.find(c => c.value === values.currency)
  return cur ? cur.symbol : 'FCFA'
})

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
      currentInvoice.value = invoiceData
      setValues({
        clientId: invoiceData.client_id,
        currency: invoiceData.currency || 'XAF',
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
    currency: formValues.currency,
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
    if (resultInvoice) {
        currentInvoice.value = { 
            ...resultInvoice, 
            invoice_items: formValues.items,
            client: clientStore.clients.find(c => c.id === formValues.clientId) 
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
  <div class="space-y-6 max-w-5xl mx-auto pb-12">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-3xl font-bold tracking-tight text-zinc-900">
        {{ isEditMode ? $t('invoice.edit') : $t('invoice.new') }}
      </h1>
      <Button v-if="isEditMode && currentInvoice" @click="handleDownloadPdf" variant="outline" class="w-full sm:w-auto">
        <FileDown class="w-4 h-4 mr-2" />
        {{ $t('invoice.download_pdf') }}
      </Button>
    </div>

    <div class="grid gap-6 lg:grid-cols-12 items-start">
      <!-- Méta-données de la facture -->
      <Card class="lg:col-span-4 p-6 space-y-6 bg-white shadow-sm border-zinc-100">
        <h3 class="font-semibold tracking-tight text-lg border-b pb-3 mb-2 text-zinc-800">Paramètres</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-1.5">{{ $t('invoice.client') }}</label>
            <select 
              v-model="clientId" 
              v-bind="clientIdProps"
              class="w-full h-11 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-shadow"
              :class="{ 'border-red-500 ring-red-500/20': errors.clientId }"
            >
              <option value="" disabled>{{ $t('invoice.choose_client') }}</option>
              <option v-for="client in clientStore.clients" :key="client.id" :value="client.id">
                {{ client.name }}
              </option>
            </select>
            <p v-if="errors.clientId" class="text-xs text-red-500 mt-1 font-medium">{{ errors.clientId }}</p>
            <p v-if="clientStore.clients.length === 0" class="text-xs text-zinc-500 mt-2">
              <router-link to="/clients" class="text-indigo-600 hover:text-indigo-700 hover:underline font-medium">{{ $t('invoice.create_client_first') }}</router-link>
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-1.5">{{ $t('invoice.currency') }}</label>
            <select 
              v-model="currency" 
              v-bind="currencyProps"
              class="w-full h-11 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-shadow"
            >
              <option v-for="c in currencies" :key="c.value" :value="c.value">
                {{ c.label }}
              </option>
            </select>
          </div>

          <Input v-model="issueDate" v-bind="issueDateProps" type="date" :label="$t('invoice.issue_date')" :error="errors.issueDate" />
          <Input v-model="dueDate" v-bind="dueDateProps" type="date" :label="$t('invoice.due_date')" :error="errors.dueDate" />
        </div>
      </Card>

      <!-- Invoice Items -->
      <Card class="lg:col-span-8 p-0 sm:p-6 sm:bg-white bg-transparent border-none sm:border-solid sm:border-zinc-100 shadow-none sm:shadow-sm space-y-6">
        
        <div class="hidden sm:grid grid-cols-12 gap-4 px-2 text-sm font-semibold text-zinc-500 pb-2 border-b uppercase tracking-wider">
          <div class="col-span-6">{{ $t('invoice.description') }}</div>
          <div class="col-span-2 text-center">{{ $t('invoice.qty') }}</div>
          <div class="col-span-2 text-right">{{ $t('invoice.unit_price') }}</div>
          <div class="col-span-2 text-right">Montant</div>
        </div>

        <div class="space-y-4">
          <div v-for="(item, index) in items" :key="item.key" class="bg-white p-4 sm:p-2 rounded-2xl sm:rounded-none border sm:border-none border-zinc-100 shadow-sm sm:shadow-none flex flex-col sm:grid sm:grid-cols-12 gap-4 items-start sm:items-center relative group">
            
            <Button variant="ghost" size="icon" @click="removeItem(index)" class="absolute top-2 right-2 sm:hidden text-red-500 hover:bg-red-50 bg-red-50/50 rounded-full w-8 h-8">
               <Trash2 class="w-4 h-4" />
            </Button>

            <div class="w-full sm:col-span-6 pr-8 sm:pr-0">
              <label class="block text-xs font-semibold text-zinc-500 mb-1 sm:hidden">{{ $t('invoice.description') }}</label>
              <Input v-model="item.value.description" placeholder="Ex: Développement Web" :error="errors[`items[${index}].description`]" class="bg-zinc-50/50 sm:bg-transparent" />
            </div>
            <div class="w-full sm:col-span-2 grid grid-cols-2 sm:block gap-4">
              <div>
                <label class="block text-xs font-semibold text-zinc-500 mb-1 sm:hidden">{{ $t('invoice.qty') }}</label>
                <Input v-model.number="item.value.quantity" type="number" placeholder="1" :error="errors[`items[${index}].quantity`]" class="bg-zinc-50/50 sm:bg-transparent sm:text-center" />
              </div>
              <div class="sm:hidden">
                <label class="block text-xs font-semibold text-zinc-500 mb-1">{{ $t('invoice.unit_price') }}</label>
                <div class="relative">
                  <Input v-model.number="item.value.unit_price" type="number" placeholder="0" :error="errors[`items[${index}].unit_price`]" class="bg-zinc-50/50 pr-8" />
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400 font-medium">
                    {{ currentSymbol }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="hidden sm:block w-full sm:col-span-2 relative">
               <Input v-model.number="item.value.unit_price" type="number" placeholder="0" :error="errors[`items[${index}].unit_price`]" class="bg-zinc-50/50 sm:bg-transparent pr-8 text-right" />
               <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400 font-medium">
                  {{ currentSymbol }}
                </div>
            </div>

            <div class="w-full sm:col-span-2 flex justify-between sm:justify-end items-center sm:pr-2">
              <span class="text-sm font-semibold text-zinc-500 sm:hidden">Montant :</span>
              <span class="font-semibold text-zinc-800">{{ Math.round(itemTotal(item)) }} {{ currentSymbol }}</span>
            </div>
            
            <div class="hidden sm:flex absolute right-0 translate-x-12 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" @click="removeItem(index)" class="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full w-8 h-8">
                <Trash2 class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <Button variant="outline" @click="addItem({ description: '', quantity: 1, unit_price: 0 })" class="w-full border-dashed border-2 py-6 text-zinc-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 rounded-2xl sm:rounded-xl bg-white sm:bg-transparent">
          <Plus class="w-5 h-5 mr-2" /> {{ $t('invoice.add_row') }}
        </Button>

        <div class="border-t border-zinc-100 pt-6 flex flex-col sm:flex-row justify-between items-end gap-6 sm:mt-8">
            <div class="w-full sm:w-auto text-right bg-white p-6 sm:p-0 rounded-3xl border border-zinc-100 sm:border-none shadow-sm sm:shadow-none">
                <span class="text-sm font-semibold text-zinc-500 uppercase tracking-widest">{{ $t('invoice.total') }}</span>
                <p class="text-4xl font-black tracking-tight text-indigo-950 mt-1">{{ Math.round(totalAmount) }} <span class="text-2xl text-indigo-600/50">{{ currentSymbol }}</span></p>
            </div>
            
            <div class="flex w-full sm:w-auto flex-col-reverse sm:flex-row gap-3">
                <Button variant="secondary" @click="router.back()" class="w-full sm:w-auto h-12">{{ $t('invoice.cancel') }}</Button>
                <Button @click="handleSave" :disabled="saving" class="w-full sm:w-auto h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 font-medium px-8">
                    {{ saving ? $t('invoice.saving') : $t('invoice.save_and_send') }}
                </Button>
            </div>
        </div>
      </Card>
    </div>
  </div>
</template>
