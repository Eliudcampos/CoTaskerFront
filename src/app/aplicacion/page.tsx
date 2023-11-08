'use client'

import { getUserData } from '@/common/utils/getUserData'
import { APIROUTES } from '@/config/routes'
import { Project, ProjectDTO } from '@/modules/Project/domain'
import { UserData } from '@/modules/User/domain'
import * as Dialog from '@radix-ui/react-dialog'
import axios from 'axios'
import cn from 'classnames'
import Cookies from 'js-cookie'
import { metronome } from 'ldrs'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface FormState {
	error: boolean
	loading: boolean
}

export default function App() {
	const [formState, setFormState] = useState<FormState>({
		error: false,
		loading: false
	})
	const [countCharacters, setCountCharacters] = useState({
		title: 30,
		description: 60
	})
	const [modal, setModal] = useState<boolean>(false)
	const [projects, setProjects] = useState<Array<Project>>([])
	let userdata: UserData | any = localStorage.getItem('userdata')
	if (userdata) {
		userdata = JSON.parse(userdata)
	}

	const currentTime = Date.now()
	const today = new Date(currentTime)

	metronome.register()

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const { title, description } = event.target.elements
		const project: Project = { title: title.value, description: description.value }
		const userId = Cookies.get('session')

		setFormState(prev => ({ ...prev, error: false, loading: true }))

		try {
			const res = await axios.post(APIROUTES.CREATEPROJECT, {
				idUsuario: userId,
				nombre: project.title,
				descripcion: project.description,
				fecha: {
					fechaEstimadaInicio: '',
					fechaEstimadaFin: ''
				}
			})
			toast.success('Proyecto creado exitosamente')
			setModal(false)
			console.log(res)
		} catch (reason: any) {
			setFormState(prev => ({ ...prev, error: true }))
			console.log(reason)
			const message = reason.response?.data.mensajes || reason.message
			toast.error(message)
		} finally {
			setFormState(prev => ({ ...prev, loading: false }))
		}
	}

	function countCharacter(e) {
		e.preventDefault()
		const { value, name } = e.target
		console.log(name, value)
		if (value === '') {
			setCountCharacters(prevCount => ({
				title: 30,
				description: 60
			}))
			return
		}
		setCountCharacters(prevCount => ({ ...prevCount, [name]: prevCount[name] - 1 }))
	}

	async function getProjects() {
		try {
			const { userId } = getUserData()
			const { data: projectsDTO } = await axios(`${APIROUTES.LISTOFPROJECTS}/${userId}`)

			const projects = projectsDTO.datos?.map(
				({ nombre, descripcion }: ProjectDTO): Project => ({
					title: nombre,
					description: descripcion
				})
			)
			setProjects(projects)
		} catch (reason) {
			console.log(reason)
		}
	}

	useEffect(() => {
		getProjects()
	}, [])

	return (
		<main className='app'>
			<aside className='sidebar'>
				<Dialog.Root open={modal} onOpenChange={setModal}>
					<Dialog.Trigger asChild>
						<button type='button' className='add' onClick={() => setModal(prev => !prev)}>
							Proyectos +
						</button>
					</Dialog.Trigger>
					<Dialog.Portal>
						<Dialog.Overlay className='DialogOverlay' />
						<Dialog.Content className='DialogContent'>
							<Dialog.Title className='DialogTitle'>Añade un nuevo proyecto</Dialog.Title>
							<Dialog.Description className='DialogDescription' asChild>
								<form
									onSubmit={handleSubmit}
									className={cn('modal-add-projects', formState.error ? 'error' : null)}
									autoComplete='off'
								>
									<label htmlFor=''>
										<input
											name='title'
											type='text'
											placeholder='Nombre del proyecto'
											onChange={countCharacter}
											required
										/>
										<span>{countCharacters.title} caracteres restantes</span>
									</label>
									<label htmlFor=''>
										<textarea
											name='description'
											placeholder='Describe este proyecto'
											cols={10}
											rows={5}
											onChange={countCharacter}
											required
										/>
										<span>{countCharacters.description} caracteres restantes</span>
									</label>
									<button type='submit' className={cn(formState.loading ? 'loading' : null)}>
										{formState.loading ? (
											<l-metronome size='24' speed='1.6' color='white'></l-metronome>
										) : (
											'Añadir proyecto'
										)}
									</button>
								</form>
							</Dialog.Description>
							<Dialog.Close />
						</Dialog.Content>
					</Dialog.Portal>
				</Dialog.Root>
				{!projects ? (
					<div className='no-projects'>Aqui se veran tus proyectos proximamente</div>
				) : (
					projects?.map(({ title, description }: Project) => (
						<article className='project' key={title}>
							{title}
						</article>
					))
				)}
			</aside>
			<section className='content'>
				<div className='title'>
					<h1 className='hi'>
						Hola, <b>{userdata.name}</b>
					</h1>
					<p className='today'>{today.toLocaleDateString()}</p>
				</div>
			</section>
		</main>
	)
}
