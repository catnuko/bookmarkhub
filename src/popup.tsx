import { Icon } from '@iconify/react'
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/css/index.css'
import { HOME_PAGE } from './constant'
import { bookmarkManager } from './manager'
const Popup = () => {
	const [count, setCount] = useState(0)
	const [currentURL, setCurrentURL] = useState<string>()

	useEffect(() => {
		chrome.action.setBadgeText({ text: count.toString() })
	}, [count])

	useEffect(() => {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			setCurrentURL(tabs[0].url)
		})
	}, [])

	const changeBackground = () => {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			const tab = tabs[0]
			if (tab.id) {
				chrome.tabs.sendMessage(
					tab.id,
					{
						color: '#555555',
					},
					msg => {
						console.log('result message:', msg)
					}
				)
			}
		})
	}
	const onChange = (e: any) => {
		console.log(e.target.checked)
	}
	function clickItem(name: any) {
		switch (name) {
			case 'sync-from-remote':
				bookmarkManager.syncFromRemote()
				break
			case 'sync-to-remote':
				bookmarkManager.syncToRemote()
				break
			case 'clear-local':
				bookmarkManager.clearLocal()
				break
			case 'show-options':
				browser.runtime.openOptionsPage()
				break
			case 'help':
				window.open(HOME_PAGE)
				break
		}
	}
	return (
		<div className="w-60 p-2 bg-white rounded">
			<div className="flex items-center justify-start p-2 cursor-pointer">
				<Icon
					icon="material-symbols:bookmark-add-outline"
					className="w-12 h-12 mr-5"
					color="#20aeff"
				/>
				<span className="text-xl font-bold font-mono" color="#20aeff">
					书签仓库
				</span>
			</div>
			<ul className="w-full p-1 border-t-2 border-gray-200">
				<li className="flex items-center justify-between w-full p-2 cursor-pointer hover:bg-gray-100 duration-300 rounded font-mono hover:font-bold">
					<div className="flex items-center justify-between">
						<Icon
							icon="material-symbols:astrophotography-auto"
							color="#20aeff"
							className="mr-5 w-6 h-6"
						></Icon>
						<span className="text-base ">自动同步</span>
					</div>
					<input
						className="justify-self-end mr-2 h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-primary checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-primary checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-primary checked:focus:bg-primary checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-primary dark:checked:after:bg-primary"
						type="checkbox"
						role="switch"
						id="flexSwitchCheckDefault01"
						onChange={onChange}
					/>
				</li>
				<li className="flex items-center justify-start w-full p-2 cursor-pointer hover:bg-gray-100 duration-300 rounded font-mono hover:font-bold">
					<Icon
						icon="ic:outline-cloud-upload"
						className="mr-5 w-6 h-6"
						color="#20aeff"
					></Icon>
					<span className="text-base ">上传到云端</span>
				</li>
				<li className="flex items-center justify-start w-full p-2 cursor-pointer hover:bg-gray-100 duration-300 rounded font-mono hover:font-bold">
					<Icon
						icon="ic:outline-cloud-download"
						className="mr-5 w-6 h-6"
						color="#20aeff"
					></Icon>
					<span className="text-base ">下载到本地</span>
				</li>
				<li className="flex items-center justify-start w-full p-2 cursor-pointer hover:bg-gray-100 duration-300 rounded font-mono hover:font-bold">
					<Icon
						icon="ep:setting"
						className="mr-5 w-6 h-6"
						color="#20aeff"
					></Icon>
					<span className="text-base ">设置</span>
				</li>
			</ul>
		</div>
	)
}

const root = createRoot(document.getElementById('root')!)

root.render(
	<React.StrictMode>
		<Popup />
	</React.StrictMode>
)
