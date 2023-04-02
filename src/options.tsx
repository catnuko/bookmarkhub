import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Tree, Button } from 'antd'
import { BackgroundEvent, BookMarks, MyBookMark, sendMsg } from './type'
import './assets/css/index.css'
import 'antd/dist/reset.css'
import { diffTree, traverseTree, filterTree } from './bookmarkManager/diffTree'
import cloneDeep from 'lodash/cloneDeep'
import remove from 'lodash/remove'
const TreeNode = Tree.TreeNode
export class DiffBookMark {
	localBookMark: MyBookMark = { bookmarks: [] }
	remoteBookMark: MyBookMark = { bookmarks: [] }
	conflictArray?: BookMarks
	constructor(localBookMark: MyBookMark, remoteBookMark: MyBookMark) {
		this.localBookMark = localBookMark
		this.remoteBookMark = remoteBookMark
	}
	getDif() {
		if (!this.conflictArray) {
			this.conflictArray = diffTree(
				this.localBookMark.bookmarks,
				this.remoteBookMark.bookmarks
			)
		}
		let cloned = cloneDeep(this.conflictArray)
		return cloned
	}
}
const Options = () => {
	let [treeData, setTreeData] = useState<any>([])
	let diffBookMark = useRef<DiffBookMark>()
	useEffect(() => {
		sendMsg(BackgroundEvent.GetConflictArray)
		chrome.runtime.onMessage.addListener(function (
			request,
			sender,
			sendResponse
		) {
			let data = request.data
			switch (request.type) {
				case BackgroundEvent.ReturnConflictArray:
					console.log('option:', request.type, request.data)
					diffBookMark.current = new DiffBookMark(
						data.localBookMark,
						data.remoteBookMark
					)
					setTreeData(diffBookMark.current.getDif())
					break
				default:
					break
			}
		})
	}, [])
	console.log(treeData)
	const save = () => {
		if (isPass()) {
			let newTreeData = cloneDeep(treeData)
			newTreeData = filterTree(newTreeData)
			traverseTree(newTreeData, (node: any) => {
				delete node._type
				delete node._isExist
			})
			console.log('option:newTreeData', newTreeData)
			sendMsg(BackgroundEvent.MergeConflict, newTreeData)
			// window.close()
		} else {
			window.alert('仍有冲突存在，请解决完再保存')
		}
	}
	const isPass = (): boolean => {
		let pass = true
		traverseTree(treeData, (node: any) => {
			if (node._type !== 'equal') {
				if (pass === false) return
				pass = typeof node._isExist !== 'undefined'
			}
		})
		console.log(pass)
		return pass
	}
	const saveAsLocal = () => {
		traverseTree(treeData, (node: any) => {
			if (node._type !== 'equal') {
				if (node._type === 'add') {
					node._isExist = true
				} else if (node._type === 'delete') {
					node._isExist = false
				}
			}
		})
		onFlush()
	}
	const saveAsRemote = () => {
		traverseTree(treeData, (node: any) => {
			if (node._type !== 'equal') {
				if (node._type === 'add') {
					node._isExist = false
				} else if (node._type === 'delete') {
					node._isExist = true
				}
			}
		})
		onFlush()
	}
	const onFlush = () => {
		setTreeData((e: any) => [...e])
	}
	return (
		<div className="container m-auto py-3">
			<div className="w-full flex gap-x-3">
				<button
					onClick={saveAsLocal}
					className="py-2 px-2 rounded text-white bg-green-600 duration-300 hover:bg-green-800"
				>
					按本地同步
				</button>
				<button
					onClick={saveAsRemote}
					className="py-2 px-2 rounded text-white bg-red-600 duration-300 hover:bg-red-700"
				>
					按远程同步
				</button>
				<button
					onClick={save}
					className="py-2 px-2 rounded text-white bg-purple-600 duration-300 hover:bg-purple-800"
				>
					保存
				</button>
			</div>
			<div className="flex justify-start items-start w-full ">
				<RenderTree treeData={treeData} onFlush={onFlush}></RenderTree>
			</div>
		</div>
	)
}
const RenderTree = (props: { treeData: BookMarks; onFlush: Function }) => {
	const { treeData, onFlush } = props
	if (!treeData.length) return null
	const TreeRef = useRef<any>()
	const [expandedKeys, setexpandedKeys] = useState<string[]>([])
	const expandedKeysFn = () => {
		let arr: string[] = []
		let loop = (data: any) => {
			data.map((item: any, index: number) => {
				arr.push(item.id)
				if (item.children && item.children.length > 0) {
					loop(item.children)
				}
			})
		}
		loop(treeData)
		setexpandedKeys(arr)
		console.log(arr)
	}
	useEffect(() => {
		expandedKeysFn()
	}, [])
	const onExpand = (expandedKeys: string[]) => {
		setexpandedKeys(expandedKeys)
	}
	return (
		<Tree
			ref={TreeRef}
			showLine
			blockNode
			defaultExpandAll
			expandedKeys={expandedKeys}
			onExpand={onExpand as any}
		>
			{treeData.map(node => renderTreeNode(node, onFlush))}
		</Tree>
	)
}
function renderTreeNode(node: any, onFlush: Function) {
	let acceptBtn
	let className = ''
	let btn = (
		<div className="flex items-center justify-start ml-3">
			<Button
				size="small"
				type="link"
				onClick={e => {
					node._isExist = true
					onFlush()
				}}
				className={node?._isExist === true ? 'bg-purple-600 text-white' : ''}
			>
				要
			</Button>
			<Button
				size="small"
				type="link"
				danger
				onClick={e => {
					node._isExist = false
					onFlush()
				}}
				className={node?._isExist === false ? 'bg-purple-600 text-white' : ''}
			>
				丢弃
			</Button>
		</div>
	)
	if (node._type == 'euqal') {
	} else if (node._type == 'add') {
		acceptBtn = btn
		className = 'bg-green-600'
	} else if (node._type == 'delete') {
		acceptBtn = btn
		className = 'bg-red-600'
	}

	return (
		<TreeNode
			title={
				<div className={'flex items-center justify-between '}>
					<div className={'rounded py-1 px-2 w-64 ' + className}>
						{node.title}
					</div>
					{acceptBtn}
				</div>
			}
			key={node.id}
		>
			{node.children?.map((node: any) => renderTreeNode(node, onFlush))}
		</TreeNode>
	)
}
const root = createRoot(document.getElementById('root')!)

root.render(<Options />)
