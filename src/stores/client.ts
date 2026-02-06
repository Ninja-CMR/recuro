import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import type { Client } from '@/types'

export const useClientStore = defineStore('client', () => {
    const clients = ref<Client[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchClients = async () => {
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
            const { data: userData } = await supabase.auth.getUser()

            const { data, error: err } = await supabase
                .from('clients')
                .insert({
                    ...clientData,
                    user_id: userData.user?.id
                })
                .select()
                .single()

            if (err) throw err

            if (data) {
                clients.value.unshift(data)
                return { data }
            }
        } catch (err: any) {
            error.value = err.message
            return { error: err }
        } finally {
            loading.value = false
        }
        return { error: 'Unknown error' }
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
        } catch (err: any) {
            return { error: err }
        } finally {
            loading.value = false
        }
        return { error: null }
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
        } catch (err: any) {
            return { error: err }
        } finally {
            loading.value = false
        }
        return { error: null }
    }

    return { clients, loading, error, fetchClients, createClient, updateClient, deleteClient }
})
