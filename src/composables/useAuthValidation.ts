import { useForm } from 'vee-validate'
import * as yup from 'yup'

export function useLoginValidation() {
    const schema = yup.object({
        email: yup.string().required('L\'email est requis').email('Email invalide'),
        password: yup.string().required('Le mot de passe est requis').min(6, 'Minimum 6 caractères')
    })

    const { errors, defineField, handleSubmit } = useForm({
        validationSchema: schema
    })

    const [email, emailProps] = defineField('email')
    const [password, passwordProps] = defineField('password')

    return {
        errors,
        email,
        emailProps,
        password,
        passwordProps,
        handleSubmit
    }
}

export function useRegisterValidation() {
    const schema = yup.object({
        fullName: yup.string().required('Le nom complet est requis').min(2, 'Trop court'),
        email: yup.string().required('L\'email est requis').email('Email invalide'),
        password: yup.string().required('Le mot de passe est requis').min(6, 'Minimum 6 caractères')
    })

    const { errors, defineField, handleSubmit } = useForm({
        validationSchema: schema
    })

    const [fullName, fullNameProps] = defineField('fullName')
    const [email, emailProps] = defineField('email')
    const [password, passwordProps] = defineField('password')

    return {
        errors,
        fullName,
        fullNameProps,
        email,
        emailProps,
        password,
        passwordProps,
        handleSubmit
    }
}
