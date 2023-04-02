import bookmarkUtils from '../utils/bookmark.js'
import * as Api from '../utils/api'
import Gist from '../utils/gist'
import {
	BackgroundEvent,
	BookMarks,
	MyBookMark,
	MsgInitedData,
	sendMsg,
} from '../type'
export default class BookMark {
	localBookMark: MyBookMark = { bookmarks: [] }
	remoteBookMark: MyBookMark = { bookmarks: [] }
	constructor(readonly initedData: MsgInitedData) {
		//初始化axios
		Api.setAccessToken(initedData.accessToken)
	}

	isSync = false
	async compareDiff() {
		this.isSync = true
		await this.setLocalBookMark()
		await this.setRemoteBookmark()
		console.log(this.localBookMark, this.remoteBookMark)
		if (!equalBookmark(this.localBookMark, this.remoteBookMark)) {
			return false
		}
		return true
	}
	//同步到远端
	async syncToRemote(bookmarks?: BookMarks) {
		this.setLocalBookMark(bookmarks)
		await this.updateRemoteBookmark(this.localBookMark)
	}
	//将远端书签同步到本地
	async syncToLocal() {
		this.setRemoteBookmark()
		clearLocal(this.localBookMark)
		createLocal(this.remoteBookMark)
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
		const bookmarks = (await Gist.fetch()) as MyBookMark
		this.remoteBookMark = bookmarks
	}
	async updateRemoteBookmark(bookmarks: MyBookMark) {
		await Gist.update(JSON.stringify(bookmarks, null, 2))
	}
}
export function equalBookmark(a: MyBookMark, b: MyBookMark) {
	let aa = JSON.stringify(a)
	let bb = JSON.stringify(b)
	const res = aa === bb
	return res
}

//清空本地的书签
async function clearLocal(myBookMark: MyBookMark) {
	if (myBookMark.bookmarks[0].children && myBookMark.bookmarks[0].children[0]) {
		let shuQianLanNode = myBookMark.bookmarks[0].children[0]
		return shuQianLanNode.children?.map(node =>
			bookmarkUtils.create(node, shuQianLanNode.id)
		)
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
