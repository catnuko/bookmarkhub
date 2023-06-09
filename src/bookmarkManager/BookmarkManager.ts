import bookmarkUtils from '../utils/bookmark.js'
import Gist from '../utils/gist'
import { BookMarks, MyBookMark, MsgInitedData } from '../type'
import { cloneDeep, update } from 'lodash'
import DiffBookMark from './DiffBookMark'
import { traverseTree } from './diffTree'
import { IRemoteStorage } from './MyBookMarkStorage/IStorage.js'
import { storageFactory } from './MyBookMarkStorage/storageFactory'

export default class BookMark {
	localBookMark: MyBookMark = { bookmarks: [] }
	remoteBookMark: MyBookMark = { bookmarks: [] }
	storage: IRemoteStorage
	constructor(
		readonly initedData: MsgInitedData,
		storageName: string = 'local'
	) {
		this.storage = storageFactory(storageName)
	}
	async hasDiff() {
		await this.setLocalBookMark()
		await this.setRemoteBookmark()
		console.log(this.localBookMark, this.remoteBookMark)
		let dif = new DiffBookMark(this.localBookMark, this.remoteBookMark)
		let difarray = dif.getDif()
		let hasDiff = false
		traverseTree(difarray, (node: any) => {
			if (node._type !== 'equal' && !hasDiff) {
				hasDiff = true
			}
		})
		return hasDiff
	}
	async mergeConflict(bookmarks: BookMarks) {
		clearLocal(this.localBookMark)
		this.setLocalBookMark(bookmarks)
		createLocal(this.localBookMark)
		await this.updateRemoteBookmark(this.localBookMark)
		await this.setRemoteBookmark()
	}
	//同步到远端
	async syncToRemote(bookmarks?: BookMarks) {
		this.setLocalBookMark(bookmarks)
		await this.updateRemoteBookmark(this.localBookMark)
		await this.setRemoteBookmark()
	}
	//将远端书签同步到本地
	async syncToLocal() {
		this.setRemoteBookmark()
		clearLocal(this.localBookMark)
		createLocal(this.remoteBookMark)
		this.localBookMark = cloneDeep(this.remoteBookMark)
	}
	//设置localBookMark,如果传入bookmarks则直接使用，否则从本地获取
	async setLocalBookMark(bookmarks?: BookMarks) {
		if (bookmarks) {
			chrome.bookmarks.removeTree(this.localBookMark.bookmarks[0].id)
			this.localBookMark = { bookmarks }
		} else {
			const newbookmarks = await bookmarkUtils.getTree()
			this.localBookMark = { bookmarks: newbookmarks }
		}
		return this.localBookMark
	}
	//设置remoteBookMark，从远端获取
	async setRemoteBookmark() {
		await this.storage.readyPromise
		const bookmarks = await this.storage.get()
		this.remoteBookMark = cloneDeep(bookmarks)
	}
	async updateRemoteBookmark(bookmarks: MyBookMark) {
		await this.storage.readyPromise
		this.storage.set(cloneDeep(bookmarks))
	}
}
export function equalBookmark(a: MyBookMark, b: MyBookMark) {
	let aa = JSON.stringify(a)
	let bb = JSON.stringify(b)
	const res = aa === bb
	return res
}
export async function updateRemoteBookmark(bookmarks: MyBookMark) {
	await Gist.update(JSON.stringify(bookmarks, null, 2))
}
//清空本地的书签
async function clearLocal(myBookMark: MyBookMark) {
	if (myBookMark.bookmarks[0].children && myBookMark.bookmarks[0].children[0]) {
		let shuQianLanNode = myBookMark.bookmarks[0].children[0]
		return shuQianLanNode.children?.map(node => bookmarkUtils.remove(node))
	} else {
		console.error('localBookMark.bookmarks[0].children is undefined')
		return Promise.reject()
	}
}
//用localBookMark创建本地书签，全量覆盖
async function createLocal(myBookMark: MyBookMark) {
	if (myBookMark.bookmarks[0].children) {
		return createBookmarks(myBookMark.bookmarks[0].children[0])
	} else {
		console.error('localBookMark.bookmarks[0].children is undefined')
		return Promise.reject()
	}
}
async function createBookmarks(bookmark: chrome.bookmarks.BookmarkTreeNode) {
	await bookmark.children?.map((node: any) =>
		bookmarkUtils.create(node, bookmark.id)
	)
}
