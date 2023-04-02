export interface MsgInitedData {
	autoSync: boolean
	accessToken: string
	gistStatus: '非法' | '合法' | '未设置'
}
export type PopupState = MsgInitedData & {
	isSyncing: boolean
}
export enum BackgroundEvent {
	//同步状态事件，一般是由background发起的
	'已同步' = '已同步',
	'同步错误' = '同步错误',
	'出现冲突' = '出现冲突',
	'GetConflictArray' = 'GetConflictArray',
	'ReturnConflictArray' = 'ReturnConflictArray',
	'MergeConflict' = 'MergeConflict',
	'CheckAccessToken' = 'CheckAccessToken',//检查令牌是否合法，由popup发起
	'ReturnCheckAccessToken' = 'ReturnCheckAccessToken',//返回令牌是否合法，由background发起
	'同步一下' = '同步一下',
	'设置令牌' = '设置令牌',
	'自动同步开关' = '自动同步开关',
	'获取初始化数据' = '获取初始化数据',
	'测试功能' = '测试功能',
}
export interface MyBookMark {
	bookmarks: BookMarks
}
export type SyncStatus =
	| '未同步'
	| '正在同步'
	| '已同步'
	| '同步错误'
	| '出现冲突'
export type BookMarks = chrome.bookmarks.BookmarkTreeNode[]
export function sendMsg(type: BackgroundEvent, data?: any) {
	chrome.runtime.sendMessage(chrome.runtime.id, {
		type,
		data,
	})
}
