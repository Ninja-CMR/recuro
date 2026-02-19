import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from './auth'
import type { Client } from '@/types'

export const useClientStore = defineStore('client', () => {
    const clients = ref<Client[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchClients = async (force = false) => {
        if (!force && clients.value.length > 0) return

        loading.value = true
        error.value = null
        try {
            const { data, error: err } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false })

            if (err) throw err
            clients.value = data || []
        } catch (err: any) {
            console.error('Error fetching clients:', err)
            error.value = err.message
            clients.value = []
        } finally {
            loading.value = false
        }
    }

    const createClient = async (clientData: Partial<Client>) => {
        loading.value = true
        error.value = null

        try {
            const authStore = useAuthStore()
            const currentUser = authStore.user

            if (!currentUser) throw new Error('Utilisateur non authentifié')

            const { data, error: err } = await supabase
                .from('clients')
                .insert({
                    ...clientData,
                    user_id: currentUser.id
                })
                .select()
                .single()

            if (err) throw err

            if (data) {
                clients.value.unshift(data)
                return { data, error: null }
            }
        } catch (err: any) {
            console.error('Error creating client:', err)
            error.value = err.message
            return { data: null, error: err }
        } finally {
            loading.value = false
        }
        return { data: null, error: new Error('Unknown error') }
    }

    const updateClient = async (id: string, updates: Partial<Client>) => {
        loading.value = true
        try {
            const { error: err } = await supabase
                .from('clients')
                .update(updates)
                .eq('id', id)

            if (err) throw err

            const index = clients.value.findIndex(c => c.id === id)
            if (index !== -1) {
                clients.value[index] = { ...clients.value[index], ...updates } as Client
            }
            return { error: null }
        } catch (err: any) {
            console.error('Error updating client:', err)
            return { error: err }
        } finally {
            loading.value = false
        }
    }

    const deleteClient = async (id: string) => {
        loading.value = true
        try {
            const { error: err } = await supabase
                .from('clients')
                .delete()
                .eq('id', id)

            if (err) throw err

            clients.value = clients.value.filter(c => c.id !== id)
            return { error: null }
        } catch (err: any) {
            console.error('Error deleting client:', err)
            return { error: err }
        } finally {
            loading.value = false
        }
    }

    return { clients, loading, error, fetchClients, createClient, updateClient, deleteClient }
})
