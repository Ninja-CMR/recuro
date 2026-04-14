import { useForm } from 'vee-validate'
import * as yup from 'yup'

export function useClientValidation() {
    const phoneRegex = /^\+?[\s\-()]*(\d[\s\-()]*){7,15}$/

    const schema = yup.object({
        name: yup.string().required('Le nom est requis').min(2, 'Trop court'),
        email: yup.string().email('Email invalide').required('L\'email est requis'),
        address: yup.string().required('L\'adresse est requise'),
        phone: yup.string()
            .required('Le numéro de téléphone est requis avec l\'indicatif (ex: +33...)')
            .matches(phoneRegex, 'Format invalide. Utilisez l\'indicatif international (ex: +33612345678)'),
        preferred_method: yup.string().oneOf(['email', 'whatsapp', 'iphone']).required('Méthode requise')
    })

    const { errors, defineField, handleSubmit, resetForm, setValues } = useForm({
        validationSchema: schema,
        initialValues: {
            name: '',
            email: '',
            address: '',
            phone: '',
            preferred_method: 'email'
        }
    })

    const [name, nameProps] = defineField('name')
    const [email, emailProps] = defineField('email')
    const [address, addressProps] = defineField('address')
    const [phone, phoneProps] = defineField('phone')
    const [preferred_method, preferredMethodProps] = defineField('preferred_method')

    return {
        errors,
        name,
        nameProps,
        email,
        emailProps,
        address,
        addressProps,
        phone,
        phoneProps,
        preferred_method,
        preferredMethodProps,
        handleSubmit,
        resetForm,
        setValues
    }
}
