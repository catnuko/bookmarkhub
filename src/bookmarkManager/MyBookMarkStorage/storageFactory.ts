import { GistRemoteStorage } from './GistRemoteStorage'
import { IRemoteStorage } from './IStorage'
import { LocalStorage } from './LocalStorage'
export function storageFactory(
	storageName: string,
	accessToken?: string
): IRemoteStorage {
	switch (storageName) {
		case 'local':
			return new LocalStorage()
		case 'github':
			return new GistRemoteStorage(accessToken as string)
		default:
			return new LocalStorage()
	}
}
