import { BookMarks, MyBookMark } from '@/type'

export interface IRemoteStorage {
	readyPromise: Promise<any>
	get(): Promise<MyBookMark>
	set(bookmarks: MyBookMark): Promise<any>
	checkTokenValid?: () => Promise<boolean>
}
export interface ILocalStorage {
	get(): MyBookMark
	set(bookmarks: MyBookMark): boolean
}
