'use client'

import { Credentials } from '@/modules/User/domain'
import { loginService } from '@/modules/User/infrastructure/login.service'
import { APPROUTES, AUTHROUTES } from '@routes'
import cn from 'classnames'
import { metronome } from 'ldrs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'

interface FormState {
	error: boolean
	loading: boolean
}

export function LoginForm() {
	const [formState, setFormState] = useState<FormState>({
		error: false,
		loading: false
	})

	const router = useRouter()

	// TODO: Modularizar a un provider los loaders a utilizar de ldrs debido a que son web components
	metronome.register()

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const { email, password } = event.target.elements
		const credentials: Credentials = { email: email.value, password: password.value }

		setFormState(prev => ({ ...prev, loading: true }))

		await loginService(credentials)
			.then(() => {
				toast.success('Sesion iniciada correctamente')
				router.push(APPROUTES.HOME)
			})
			.catch(reason => {
				toast.error(reason.message)
				setFormState(prev => ({ ...prev, error: true }))
			})
			.finally(() => {
				setFormState(prev => ({ ...prev, loading: false }))
			})
	}
	return (
		<form onSubmit={handleSubmit} autoComplete='on' className={cn(formState.error ? 'error' : null)}>
			<h3>Ingrese sus credenciales</h3>
			<input
				id='email'
				name='email'
				type='email'
				placeholder='Correo Electronico'
				autoComplete='email'
				autoFocus
				required
			/>
			<input
				id='password'
				name='password'
				type='password'
				placeholder='Contraseña'
				autoComplete='current-password'
				required
			/>
			<button type='submit' className={cn(formState.loading ? 'loading' : null)}>
				{formState.loading ? <l-metronome size='24' speed='1.6' color='white'></l-metronome> : 'Iniciar sesion'}
			</button>

			<p className='change'>
				No tienes una cuenta?{' '}
				<b>
					<Link href={AUTHROUTES.REGISTER}>Registrate</Link>
				</b>
			</p>
		</form>
	)
}
