import { FILE_NAME, GIST_DESC } from '../utils/constant'
import storage from '../utils/storage'
import { GistSource } from './GistApi'
type GithubGist = any
export class GistSync {
	gist: GithubGist
	constructor() {}
	delete(): Promise<any> {
		this.gist = null
		return storage.removeItem('gist')
	}
	async getGist() {
		if (this.gist) return this.gist
		let gist = await storage.getItem('gist')
		gist = gist && JSON.parse(gist)
		this.gist = gist
		return gist
	}
	async setGist(gist: GithubGist) {
		delete gist.files
		delete gist.history
		this.gist = gist
		return storage.setItem('gist', JSON.stringify(gist))
	}
}
