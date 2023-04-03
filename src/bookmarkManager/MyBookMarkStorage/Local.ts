export const Local = {
	async setItem(key: string, value: any) {
		return new Promise((resolve, reject) => {
			chrome.storage.local.set(
				{
					[key]: value,
				},
				() => {
					if (chrome.runtime.lastError) {
						reject(chrome.runtime.lastError)
					} else {
						resolve('')
					}
				}
			)
		})
	},
	async getItem(key: string) {
		return new Promise((resolve, reject) => {
			chrome.storage.local.get(key, res => {
				if (chrome.runtime.lastError) {
					reject(chrome.runtime.lastError)
				} else {
					const result = res && res[key]
					resolve(result)
				}
			})
		})
	},
	async removeItem(key: string) {
		return new Promise((resolve, reject) => {
			chrome.storage.local.remove(key, () => {
				if (chrome.runtime.lastError) {
					reject(chrome.runtime.lastError)
				} else {
					resolve('')
				}
			})
		})
	},
	console() {
		chrome.storage.local.get(null, function (items) {
			console.log('chrome.storage.local.get')
			console.log(items)
		})
	},
}
