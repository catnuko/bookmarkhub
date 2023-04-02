import { GistApi } from './GistApi'
import storage from '../utils/storage'
import { FILE_NAME, GIST_DESC } from '../utils/constant'
import { GistSync } from './GistSync'
import { Octokit } from '@octokit/rest'
import { MyBookMark } from '@/type'
export interface GistOptions {
	accessToken: string
	syncInterval?: number
}
export default class Gist {
	octokit: Octokit
	syncInterval: number
	syncIntervalHandler: any
	gist: any
	readyPromise: Promise<any>
	bookmarks: MyBookMark = { bookmarks: [] }
	private resolve: any
	private reject: any
	constructor(readonly _options: GistOptions) {
		const { accessToken, syncInterval = 1 * 60 * 60 * 1000 } = _options
		this.octokit = new Octokit({ auth: accessToken })
		this.syncInterval = syncInterval
		this.readyPromise = new Promise((resl: any, rej: any) => {
			this.resolve = resl
			this.reject = rej
		})
		this.create()
		this.initSyncIntervalHandler()
	}
	checkAccessToken() {
		return !!this.gist
	}
	async create() {
		//如果本地没有gist，查看远端是否有gist，如果有，同步到本地，如果没有，创建一个gist
		//如果本地有gist,则不做任何操作
		if (!this.gist) {
			this.gist = await getGistInList(this.octokit)
			if (!this.gist) {
				this.gist = await createEmpty(this.octokit)
			}
			await this.initMyBookMark()
			return
		}
		await this.initMyBookMark()
		console.log('Gist', this.gist, this.bookmarks)
	}
	async initMyBookMark() {
		await this.octokit
			.request({
				method: 'GET',
				url: this.gist.files[FILE_NAME].raw_url,
				headers: {
					responseType: 'text',
				},
			})
			.then(res => {
				if (res.status === 200) {
					this.bookmarks = JSON.parse(res.data)
				}
			})
		this.resolve()
	}
	initSyncIntervalHandler() {
		if (this.syncIntervalHandler) {
			clearInterval(this.syncIntervalHandler)
			this.syncIntervalHandler = null
		}
		this.syncIntervalHandler = setInterval(() => {
			this.commit()
		}, this.syncInterval)
	}
	getMyBookMark() {
		return this.bookmarks
	}
	setMyBookMark(bookmarks: MyBookMark) {
		this.bookmarks = bookmarks
	}
	async needSync() {
		let time = await storage.getItem('lastSyncTime')
		time = time && parseInt(time)
		if (!time) return true
		return new Date().valueOf() - time > this.syncInterval
	}
	async commit() {
		let gist = this.gist
		storage.setItem('lastSyncTime', new Date().valueOf())
		await updateGistRemote(
			this.octokit,
			gist.id,
			JSON.stringify(this.bookmarks, null, 2)
		)
		this.initSyncIntervalHandler()
	}
}
function getGistById(octokit: Octokit, gistId: string) {
	return octokit.gists.get({ gist_id: gistId }).then(res => {
		if (res.status === 200) {
			if (res.data.files?.[FILE_NAME]) {
				let file = res.data.files[FILE_NAME]
				if (file.content) {
					return JSON.parse(file.content)
				}
			}
		}
	})
}
function getGistInList(octokit: Octokit) {
	return octokit.gists.list().then(res => {
		if (res.status === 200) {
			return res.data.find(x => x.files[FILE_NAME])
		}
	})
}
function createEmpty(octokit: Octokit) {
	return octokit.gists
		.create({
			description: GIST_DESC,
			public: false,
			files: {
				[FILE_NAME]: {
					content: '{}',
				},
			},
		})
		.then(res => {
			if (res.status === 201) {
				return res.data
			}
		})
}
function updateGistRemote(octokit: Octokit, gistId: string, content: string) {
	return octokit.gists.update({
		gist_id: gistId,
		files: {
			[FILE_NAME]: {
				content,
			},
		},
	})
}
async function getGistFromSync() {
	let gist = await storage.getItem('gist')
	gist = gist && JSON.parse(gist)
	return gist
}
async function setGistToSync(gist: any) {
	return storage.setItem('gist', JSON.stringify(gist))
}
async function deleteGistFromSync() {
	return storage.removeItem('gist')
}
