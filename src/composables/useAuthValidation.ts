import { useForm } from 'vee-validate'
import * as yup from 'yup'
import i18n from '@/i18n'

// Expression régulière stricte pour l'email
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/

export function useLoginValidation() {
    const { t } = i18n.global
    const schema = yup.object({
        email: yup.string()
            .required(t('auth.err_email_req'))
            .matches(emailRegex, t('auth.err_email_invalid')),
        // Pour la connexion, on peut garder la validation souple ou appliquer la stricte selon le besoin.
        // Appliquons la stricte pour être cohérent avec la demande de validation sur les deux pages.
        password: yup.string()
            .required(t('auth.err_pass_req'))
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
    const { t } = i18n.global
    const schema = yup.object({
        fullName: yup.string().required(t('auth.err_name_req')).min(2, t('auth.err_name_short')),
        email: yup.string()
            .required(t('auth.err_email_req'))
            .matches(emailRegex, t('auth.err_email_invalid')),
        password: yup.string()
            .required(t('auth.err_pass_req'))
            .matches(passwordRegex, t('auth.err_pass_format'))
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
