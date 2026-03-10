import { useForm, useFieldArray } from 'vee-validate'
import * as yup from 'yup'

interface InvoiceFormValues {
    clientId: string
    currency: string
    issueDate: any
    dueDate: any
    items: {
        description: string
        quantity: number
        unit_price: number
    }[]
}

export function useInvoiceValidation() {
    const schema = yup.object({
        clientId: yup.string().required('Le client est requis'),
        currency: yup.string().required('La devise est requise'),
        issueDate: yup.date().required('La date est requise'),
        dueDate: yup.date().required('La date d\'échéance est requise'),
        items: yup.array().of(
            yup.object({
                description: yup.string().required('Description requise'),
                quantity: yup.number().transform(value => (isNaN(value) || value === null || value === '') ? null : value).nullable().default(0).min(0, 'Min 0'),
                unit_price: yup.number().transform(value => (isNaN(value) || value === null || value === '') ? null : value).nullable().default(0).min(0, 'Min 0')
            })
        ).min(1, 'Au moins un article est requis')
    })

    const { errors, defineField, handleSubmit, values, setValues } = useForm<InvoiceFormValues>({
        validationSchema: schema,
        initialValues: {
            clientId: '',
            currency: 'EUR', // Default currency
            issueDate: new Date().toISOString().split('T')[0] as any,
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as any,
            items: [
                { description: 'Service de base', quantity: 1, unit_price: 100 }
            ]
        }
    })

    const [clientId, clientIdProps] = defineField('clientId')
    const [currency, currencyProps] = defineField('currency')
    const [issueDate, issueDateProps] = defineField('issueDate')
    const [dueDate, dueDateProps] = defineField('dueDate')

    const { fields, push, remove } = useFieldArray<InvoiceFormValues['items'][number]>('items')

    return {
        errors,
        values,
        clientId,
        clientIdProps,
        currency,
        currencyProps,
        issueDate,
        issueDateProps,
        dueDate,
        dueDateProps,
        fields,
        push,
        remove,
        handleSubmit,
        setValues
    }
}
