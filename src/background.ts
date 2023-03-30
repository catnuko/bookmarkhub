import storage from './utils/storage'

function polling() {
	// console.log("polling");
	setTimeout(polling, 1000 * 30)
}

polling()
chrome.bookmarks.onChanged.addListener(function (id, changeInfo) {
	console.log('onChanged', id, changeInfo)
})
chrome.bookmarks.onCreated.addListener(function (id, bookmark) {
	console.log('onCreated', id, bookmark)
})
chrome.bookmarks.onMoved.addListener(function (id, moveInfo) {
	console.log('onMoved', id, moveInfo)
})
chrome.bookmarks.onRemoved.addListener(function (id, removeInfo) {
	console.log('onRemoved', id, removeInfo)
})
chrome.bookmarks.onChildrenReordered.addListener(function (id, reorderInfo) {
	console.log('onChildrenReordered', id, reorderInfo)
})

chrome.runtime.onMessage.addListener(async function (
	request,
	sender,
	sendResponse
) {
	let data = request.data
	console.log('onMessage', request)
	switch (request.type) {
		case '同步一下':
			sendResponse('ok')
			break
		case '设置令牌':
			storage.setItem('gistToken', data)
			sendResponse('ok')
			break
		case '自动同步开关':
			storage.setItem('autoSync', data)
			sendResponse('ok')
			break
		case '获取初始化数据':
			await initData(sendResponse)
			break
		case '测试功能':
			const initedData = await initData(sendResponse)
			let popup = await chrome.windows.getCurrent()
			console.log(popup)
			chrome.runtime.sendMessage(popup.id + '', initedData, function (response) {
				console.log(response)
			})
			break
		default:
			break
	}
})

async function initData(sendResponse: (response?: any) => void) {
	let pl = [
		storage.getItem('autoSync').then(autoSync => {
			if (autoSync === null) {
				storage.setItem('autoSync', true)
				return true
			} else {
				return autoSync
			}
		}),
	]
	const resList = await Promise.all(pl)
	const initData = {
		autoSync: resList[0],
	}
	sendResponse(initData)
}

// // 获取所有 tab
// const pups = chrome.extension.getViews({
//     type: 'popup'
// }) || []

// // 输出第一个使用插件页面的url
// if (pups.length) {
//     console.log(pups[0].location.href)
// }
