import { FILE_NAME, GIST_DESC } from '../../utils/constant'
import { IRemoteStorage } from './IStorage'
import { MyBookMark } from '@/type'
import { setAccessToken, default as $api } from '../../utils/api'
export class GistRemoteStorage implements IRemoteStorage {
	readyPromise: Promise<any>
	private resolve: any
	private reject: any
	constructor(readonly accessToken: string) {
		setAccessToken(accessToken)
		this.readyPromise = new Promise((resl: any, rej: any) => {
			this.resolve = resl
			this.reject = rej
		})
		this.resolve()
	}
	checkTokenValid() {
		return list()
			.then(e => {
				return true
			})
			.catch(e => {
				return false
			})
	}
	async checkAndCreateOne() {
		if (!this.rawGist) {
			const gists = await list()
			const gist = gists.find((g: any) => g.files[FILE_NAME])
			if (gist) {
				this.rawGist = gist
			}
			if (!this.rawGist) {
				this.rawGist = await createEmpty()
			}
		}
	}
	async set(bookmarks: MyBookMark): Promise<any> {
		await this.checkAndCreateOne()
		this.rawGist = await update(this.rawGist.id, bookmarks)
	}
	rawGist: any
	async get(): Promise<MyBookMark> {
		if (this.rawGist) {
			return getFromRawGist(this.rawGist)
		}
		await this.checkAndCreateOne()
		return getFromRawGist(this.rawGist)
	}
}
async function getFromRawGist(rawGist: any): Promise<MyBookMark> {
	const gistFile = rawGist.files[FILE_NAME]
	let fileContent
	if (gistFile.truncated) {
		fileContent = await $api
			.get(gistFile.raw_url, { responseType: 'blob' })
			.then(resp => resp.text())
	} else {
		fileContent = gistFile.content
	}
	return fileContent
		? (JSON.parse(fileContent) as MyBookMark)
		: { bookmarks: [] }
}

async function update(gistId: string, content: MyBookMark) {
	const data = {
		files: {
			[FILE_NAME]: {
				content: content,
			},
		},
	}
	return await $api
		.patch(`/gists/${gistId}`, JSON.stringify(data))
		.then(async res => {
			if (res.status !== 200) throw new Error(res.statusText)
			const gist = await res.json()
			return gist
		})
}
async function createEmpty() {
	return await $api
		.post('/gists', {
			description: GIST_DESC,
			files: {
				[FILE_NAME]: {
					content: '{}',
				},
			},
			public: false,
		})
		.then(async res => {
			if (res.status !== 201) throw new Error(res.statusText)
			const gist = await res.json()
			return gist
		})
}
async function list() {
	return await $api.get(`/gists`).then(async res => {
		return await res.json()
	})
}
