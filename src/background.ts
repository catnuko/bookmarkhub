import { cloneDeep } from 'lodash'
import BookMark from './bookmarkManager/BookmarkManager'
import { MsgInitedData, BackgroundEvent, sendMsg } from './type'
import storage from './utils/storage'
function polling() {
	// console.log("polling");
	setTimeout(polling, 1000 * 30)
}

polling()
let bookmarkManager: BookMark
let bookmarkManagerPromise: Promise<BookMark>
let bookmarkManagerResolve: (value: BookMark) => void
let bookmarkManagerReject: (reason?: any) => void
bookmarkManagerPromise = new Promise((resolve, reject) => {
	bookmarkManagerResolve = resolve
	bookmarkManagerReject = reject
})
async function onChange() {
	bookmarkManager = await bookmarkManagerPromise
	await bookmarkManager.syncToRemote()
	sendMsg(BackgroundEvent.已同步)
}
chrome.bookmarks.onChanged.addListener(async function (id, changeInfo) {
	console.log('onChanged', id, changeInfo)
	onChange()
})
chrome.bookmarks.onCreated.addListener(async function (id, bookmark) {
	console.log('onCreated', id, bookmark)
	onChange()
})

chrome.bookmarks.onMoved.addListener(async function (id, moveInfo) {
	console.log('onMoved', id, moveInfo)
	onChange()
})
chrome.bookmarks.onRemoved.addListener(async function (id, removeInfo) {
	console.log('onRemoved', id, removeInfo)
	onChange()
})
chrome.bookmarks.onChildrenReordered.addListener(async function (
	id,
	reorderInfo
) {
	console.log('onChildrenReordered', id, reorderInfo)
	onChange()
})
chrome.runtime.onConnect.addListener(function (port) {
	console.log(port)
})
chrome.runtime.onMessage.addListener(async function (
	request,
	sender,
	sendResponse
) {
	let data = request.data
	console.log('background:', request.type, request.data)
	let initedData: MsgInitedData
	switch (request.type) {
		case BackgroundEvent.同步一下:
			initedData = await initData()
			if (!initedData.accessToken) {
				sendMsg(BackgroundEvent.同步错误, '请先设置令牌')
				return
			}
			try {
				bookmarkManager = await bookmarkManagerPromise
				let res = await bookmarkManager.hasDiff()
				if (res) {
					sendMsg(BackgroundEvent.出现冲突)
				} else {
					sendMsg(BackgroundEvent.已同步)
				}
			} catch (error) {
				sendMsg(BackgroundEvent.同步错误, '同步错误，请联系管理员')
				console.error(error)
			}
			break
		case BackgroundEvent.GetConflictArray:
			bookmarkManagerPromise.then(bookmarkManager => {
				console.log('bookmarkManager')
				console.log(bookmarkManager)
				sendMsg(BackgroundEvent.ReturnConflictArray, {
					localBookMark: cloneDeep(bookmarkManager.localBookMark),
					remoteBookMark: cloneDeep(bookmarkManager.remoteBookMark),
				})
			})
		case BackgroundEvent.设置令牌:
			initedData = await initData()
			initedData.accessToken = data
			setInitedData(initedData)
			break
		case BackgroundEvent.自动同步开关:
			initedData = await initData()
			initedData.autoSync = data
			setInitedData(initedData)
			break
		//option页面发来的消息,用于合并冲突
		case BackgroundEvent.MergeConflict:
			let newTreeData = data
			bookmarkManager = await bookmarkManagerPromise
			bookmarkManager.mergeConflict(newTreeData)
			break
		case BackgroundEvent.获取初始化数据:
			initedData = await initData()
			console.log('background:initedData', initedData)
			sendMsg(BackgroundEvent.获取初始化数据, initedData)
			if (!bookmarkManager) {
				bookmarkManager = new BookMark(initedData)
				bookmarkManagerResolve(bookmarkManager)
			}
			break
		case BackgroundEvent.测试功能:
			chrome.storage.sync.get(null, function (items) {
				console.log('chrome.storage.sync.get')
				console.log(items)
			})
			chrome.storage.sync
			bookmarkManager = await bookmarkManagerPromise
			bookmarkManager.syncToLocal()
			break
		case BackgroundEvent.CheckAccessToken:
			bookmarkManager = await bookmarkManagerPromise
			let res = await bookmarkManager.checkAccessToken()
			sendMsg(BackgroundEvent.ReturnCheckAccessToken, res)
			break
		default:
			break
	}
})
function getItem<T>(key: string, defaultValue: T) {
	return storage.getItem(key).then(value => {
		if (!value) {
			storage.setItem(key, defaultValue)
			return defaultValue
		} else {
			return value
		}
	})
}
async function setInitedData(data: MsgInitedData) {
	return storage.setItem('initedData', data)
}
async function initData(): Promise<MsgInitedData> {
	const initedData = await getItem<MsgInitedData>('initedData', {
		autoSync: true,
		accessToken: '',
		gistStatus: '未设置',
	})
	if (!initedData.accessToken) {
		initedData.accessToken = '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'
	}
	setInitedData(initedData)
	return initedData
}

// // 获取所有 tab
// const pups = chrome.extension.getViews({
//     type: 'popup'
// }) || []

// // 输出第一个使用插件页面的url
// if (pups.length) {
//     console.log(pups[0].location.href)
// }

// // 获取当前激活的tab
// chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
// 	console.log('bg:tabs')
// 	console.log(tabs)
// 	// 发送消息到当前tab
// 	if (tabs[0]?.id) {
// 		chrome.tabs.sendMessage(tabs[0].id, {
// 			greeting: 'Hello from background!',
// 		})
// 	}
// })
