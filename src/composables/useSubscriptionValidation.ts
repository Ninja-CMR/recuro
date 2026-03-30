import { useForm } from 'vee-validate'
import { useAuthStore } from '@/stores/auth'
import * as yup from 'yup'

interface SubscriptionFormValues {
    clientId: string
    name: string
    amount: number
    currency: string
    frequency: 'monthly' | 'quarterly' | 'yearly'
    startDate: string
    description?: string
}

export function useSubscriptionValidation() {
    const schema = yup.object({
        clientId: yup.string().required('Le client est requis'),
        name: yup.string().required(`Le nom de l'abonnement est requis`),
        amount: yup.number()
            .transform(value => (isNaN(value) || value === null || value === '') ? null : value)
            .nullable()
            .default(0)
            .min(0, 'Le montant minimum est 0')
            .required('Le montant est requis'),
        currency: yup.string().required('La devise est requise'),
        frequency: yup.string()
            .oneOf(['monthly', 'quarterly', 'yearly'], 'Fréquence invalide')
            .required('La fréquence est requise'),
        startDate: yup.date().required('La date de début est requise'),
        description: yup.string().nullable()
    })

    const { errors, defineField, handleSubmit, values, setValues } = useForm<SubscriptionFormValues>({
        validationSchema: schema,
        initialValues: {
            clientId: '',
            name: '',
            amount: 0,
            currency: useAuthStore().userProfile?.currency || 'XAF',
            frequency: 'monthly',
            startDate: new Date().toISOString().split('T')[0],
            description: ''
        }
    })

    const [clientId, clientIdProps] = defineField('clientId')
    const [name, nameProps] = defineField('name')
    const [amount, amountProps] = defineField('amount')
    const [currency, currencyProps] = defineField('currency')
    const [frequency, frequencyProps] = defineField('frequency')
    const [startDate, startDateProps] = defineField('startDate')
    const [description, descriptionProps] = defineField('description')

    return {
        errors,
        values,
        clientId, clientIdProps,
        name, nameProps,
        amount, amountProps,
        currency, currencyProps,
        frequency, frequencyProps,
        startDate, startDateProps,
        description, descriptionProps,
        handleSubmit,
        setValues
    }
}