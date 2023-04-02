import { Icon } from '@iconify/react'
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/css/index.css'
import { HOME_PAGE } from './constant'

import {
	MsgInitedData,
	PopupState,
	BackgroundEvent,
	SyncStatus,
	sendMsg,
} from './type'
const SUCCESS = 'emojione-v1:left-check-mark'
const LOADING = 'eos-icons:loading'
const ERROR = 'material-symbols:error-outline'

const Popup = () => {
	const [initedData, setInitedData] = useState<PopupState>({
		autoSync: false,
		isSyncing: false,
		accessToken: '',
		gistStatus: '未设置',
	})
	const [syncStatus, setSyncStatus] = useState<SyncStatus>('未同步')
	const [errorMsg, setErrorMsg] = useState('')
	useEffect(() => {
		sendMsg(BackgroundEvent.获取初始化数据)
		chrome.runtime.onMessage.addListener(function (
			request,
			sender,
			sendResponse
		) {
			console.log('popup:', request.type, request.data)
			let data = request.data
			switch (request.type) {
				case BackgroundEvent.获取初始化数据:
					if (data) {
						setInitedData({
							...initedData,
							...data,
						})
						clickItem('同步一下')
					}
					break
				case BackgroundEvent.已同步:
					setSyncStatus('已同步')
					break
				case BackgroundEvent.出现冲突:
					setSyncStatus('同步错误')
					setErrorMsg('出现冲突')
					break
				case BackgroundEvent.同步错误:
					setSyncStatus('同步错误')
					setErrorMsg(data)
					break
				default:
					break
			}
		})
	}, [])
	const onAutoSyncChange = (e: any) => {
		setInitedData((v: PopupState) => ({
			...v,
			autoSync: e.target.checked,
		}))
		sendMsg(BackgroundEvent.自动同步开关, e.target.checked)
	}
	function clickItem(name: any) {
		switch (name) {
			case '同步一下':
				sendMsg(BackgroundEvent.同步一下)
				setSyncStatus('正在同步')
				break
			case '测试功能':
				chrome.runtime.sendMessage({
					type: BackgroundEvent.测试功能,
				})

				break
		}
	}
	const onGistInputChange = (e: any) => {
		setInitedData((v: PopupState) => ({
			...v,
			accessToken: e.target.value,
		}))
		sendMsg(BackgroundEvent.设置令牌, e.target.value)
	}
	return (
		<div className="p-2 bg-white rounded" style={{ width: '400px' }}>
			<div className="flex items-center justify-center p-1 cursor-pointer">
				<Icon
					icon="material-symbols:bookmark-add-outline"
					className="w-12 h-12 mr-3"
				/>
				<span className="text-xl font-bold">书签仓库</span>
			</div>
			<ul className="w-full p-1 border-t-2 border-gray-100">
				<li
					className="flex items-center justify-between w-full p-2 cursor-pointer duration-300 rounded hover:bg-purple-800 hover:text-white"
					onClick={e => clickItem('同步一下')}
				>
					<div className="flex items-center justify-between">
						<Icon
							icon="ic:outline-cloud-upload"
							className="mr-5 w-6 h-6"
						></Icon>
						<span className="text-base ">同步一下</span>
					</div>
					<RenderSyncIcon
						syncStatus={syncStatus}
						errorMsg={errorMsg}
					></RenderSyncIcon>
				</li>
				<li className="flex items-center justify-between w-full p-2 cursor-pointer duration-300 rounded hover:bg-purple-800 hover:text-white">
					<div className="flex items-center justify-between">
						<Icon
							icon="material-symbols:astrophotography-auto"
							className="w-6 h-6 mr-5"
						></Icon>
						<span className="text-base ">自动同步</span>
					</div>
					<input
						className="justify-self-end mr-2 h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-primary checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-primary checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-primary checked:focus:bg-primary checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-neutral-400 dark:checked:bg-primary dark:checked:after:bg-primary"
						type="checkbox"
						role="switch"
						id="flexSwitchCheckDefault01"
						checked={initedData.autoSync}
						onChange={onAutoSyncChange}
					/>
				</li>
				<li className="flex items-center justify-between w-full p-2 cursor-pointer duration-300 rounded hover:bg-purple-800 hover:text-white">
					<div className="flex items-center justify-between">
						<Icon
							icon="material-symbols:astrophotography-auto"
							className="w-6 h-6 mr-5"
						></Icon>
						<select
							id="country"
							name="country"
							autoComplete="country-name"
							className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
						>
							<option>按本地同步</option>
							<option>按远程同步</option>
						</select>
					</div>
				</li>
				<li
					className="flex items-center justify-between w-full p-2 cursor-pointer duration-300 rounded hover:bg-purple-800 hover:text-white"
					onClick={e => clickItem('设置')}
				>
					<div className="flex items-center justify-between">
						<Icon icon="ep:setting" className="mr-5 w-6 h-6">
							Github AccessToken
						</Icon>
						<input
							type="password"
							name="street-address"
							id="street-address"
							autoComplete="street-address"
							value={initedData.accessToken}
							onChange={onGistInputChange}
							className="p-2 block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
						/>
					</div>
					<Icon icon={LOADING} />
				</li>
				<li
					className="flex items-center justify-start w-full p-2 cursor-pointer duration-300 rounded hover:bg-purple-800 hover:text-white"
					onClick={e => clickItem('测试功能')}
				>
					<Icon icon="ep:setting" className="mr-5 w-6 h-6"></Icon>
					<span>测试数据</span>
				</li>
			</ul>
			<div className="flex items-center justify-start p-2 cursor-pointer border-t-2 border-gray-100">
				<Icon
					icon="mdi:github"
					className="w-6 h-6"
					onClick={e => {
						window.open(HOME_PAGE)
					}}
				/>
			</div>
		</div>
	)
}
const RenderSyncIcon = (props: {
	syncStatus: SyncStatus
	errorMsg: string
}) => {
	const { syncStatus, errorMsg } = props
	const onClick = () => {
		if (syncStatus === '同步错误') {
			chrome.runtime.openOptionsPage()
		}
	}
	if (syncStatus === '未同步') return null
	else {
		let icon =
			syncStatus === '正在同步'
				? LOADING
				: syncStatus === '已同步'
				? SUCCESS
				: ERROR
		if (icon === ERROR) {
			return (
				<div className="flex items-center justify-end" onClick={onClick}>
					<Icon icon={icon} className="w-4 h-4" />
					<span className="truncate text-sm text-orange-400">{errorMsg}</span>
				</div>
			)
		} else {
			return (
				<div className="flex items-center justify-end" onClick={onClick}>
					<div className="mr-3">{syncStatus}</div>
					<Icon icon={icon} className="w-4 h-4" />
					<span className="truncate text-sm text-slate-400">
						2022-12-30 15:41
					</span>
				</div>
			)
		}
	}
}
const root = createRoot(document.getElementById('root')!)

root.render(<Popup />)
