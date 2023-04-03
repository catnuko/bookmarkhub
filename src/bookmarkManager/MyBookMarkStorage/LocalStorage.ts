import { MyBookMark } from '@/type'
import { IRemoteStorage } from './IStorage'
import { Local } from './Local'

export class LocalStorage implements IRemoteStorage {
	readyPromise: Promise<any>
	constructor() {
		this.readyPromise = Promise.resolve()
	}
	async get(): Promise<MyBookMark> {
		let item = (await Local.getItem('bookmarks')) as MyBookMark
		if (!item) {
			item = {
				bookmarks: [],
			}
			await this.set(item)
		}
		return item
	}
	set(bookmarks: MyBookMark): Promise<any> {
		return Local.setItem('bookmarks', bookmarks)
	}
}
