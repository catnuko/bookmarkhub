export interface GistSource {
	create(): Promise<any>
	update(content: string): Promise<any>
	delete(): Promise<any>
	getById(id: string): Promise<any>
	getGists(): Promise<any>
}
import { FILE_NAME, GIST_DESC } from '../utils/constant'
import $axios, { AxiosInstance } from 'axios'
export class GistApi implements GistSource {
	axios: AxiosInstance
	constructor(readonly accessToken: string, readonly gistId?: string) {
		this.axios = $axios.create({
			baseURL: 'https://api.github.com',
			headers: {
				'Content-Type': 'application/json;charset=UTF-8',
				Accept: 'application/vnd.github.v3+json',
				Authorization: `bearer ${accessToken}`,
			},
		})
	}
	async create(): Promise<any> {
		const response = await this.axios.post('/gists', {
			description: GIST_DESC,
			public: false,
			files: {
				[FILE_NAME]: {
					content: '{}',
				},
			},
		})
		return response.data
	}

	async update(content: string): Promise<any> {
		const response = await this.axios.patch(`/gists/${this.gistId}`, {
			files: {
				[FILE_NAME]: {
					content,
				},
			},
		})
		return response.data
	}

	async delete(): Promise<any> {
		const response = await this.axios.delete(`/gists/${this.gistId}`)
		return response.data
	}

	async getById(id: string): Promise<any> {
		const response = await this.axios.get(`/gists/${id}`)
		return response.data
	}

	async getGists(): Promise<any> {
		const response = await this.axios.get('/gists')
		return response.data
	}
}
