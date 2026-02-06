import { useForm } from 'vee-validate'
import * as yup from 'yup'

export function useClientValidation() {
    const schema = yup.object({
        name: yup.string().required('Le nom est requis').min(2, 'Trop court'),
        email: yup.string().email('Email invalide').nullable(),
        address: yup.string().nullable()
    })

    const { errors, defineField, handleSubmit, resetForm, setValues } = useForm({
        validationSchema: schema,
        initialValues: {
            name: '',
            email: '',
            address: ''
        }
    })

    const [name, nameProps] = defineField('name')
    const [email, emailProps] = defineField('email')
    const [address, addressProps] = defineField('address')

    return {
        errors,
        name,
        nameProps,
        email,
        emailProps,
        address,
        addressProps,
        handleSubmit,
        resetForm,
        setValues
    }
}
