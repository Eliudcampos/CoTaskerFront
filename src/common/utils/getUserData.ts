import { UserData } from '@/modules/User/domain'

export function getUserData(): UserData {
	const localStorageUserData = localStorage.getItem('userdata')
	if (localStorageUserData) {
		const userdata = JSON.parse(localStorageUserData)
		return userdata
	}

	throw new Error('No existe informacion del usuario')
}
