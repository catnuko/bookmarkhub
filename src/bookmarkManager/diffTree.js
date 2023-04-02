import find from 'lodash/find'
import remove from 'lodash/remove'
export const diffTree = (last, past) => {
	const arr = []
	function deepLoop(lastArr, pastArr, arr) {
		const copyArr = [...pastArr]
		/* 获取新增的和相等的 */
		lastArr.forEach((item, key) => {
			// 此处判断 pastArr 中是否包含item中的元素,包含则为相同
			// _.find([{id:'1'}], ['id', '1']) true
			const findArr = find(pastArr, ['id', item.id]) || false
			if (findArr) {
				item._type = 'equal'
				arr[key] = item
				// 删除copyArr 中相同的则剩余是不同 _.remove 删除原数组中返回true的数据
				remove(copyArr, val => val.id === item.id)
				if (item.children && findArr.children && arr[key].children) {
					deepLoop(item.children, findArr.children, arr[key].children)
				}
			} else {
				item._type = 'add'
				arr[key] = item
				if (item.children && arr[key].children) {
					deepLoop(item.children, [], arr[key].children)
				}
			}
		})

		/* 剩余删除的数据进行递归数据标识符补全 */
		copyArr.forEach(val => {
			val._type = 'delete'
			if (val.children?.length > 0) {
				const addArr = addLoopType(val.children, 'delete')
				val.children = addArr
			}
			arr.push(val)
		})
	}
	deepLoop(last, past, arr)
	return arr
}
// 添加deep 循环属性,此处是用于delete 删除数据加入标识符
function addLoopType(arr, type) {
	const a = []
	function deepLoop1(copyArr, newArr) {
		copyArr.forEach((val, key) => {
			val._type = type
			newArr[key] = val
			if (val.children) {
				deepLoop1(val.children, newArr[key].children)
			}
		})
	}
	deepLoop1(arr, a)
	return a
}
// 遍历树状结构
export function traverseTree(arr, callback) {
	arr.forEach(item => {
		callback(item, arr)
		if (item.children) {
			traverseTree(item.children, callback)
		}
	})
}
// 使用lodash的remove函数，移除树状结构中的一个节点
function removeNode(arr, id) {
	remove(arr, item => {
		if (item.id === id) {
			return true
		} else if (item.children) {
			removeNode(item.children, id)
		}
	})
}
export function filterTree(arr) {
	return arr.filter(item => {
		if (item?.isExist === false) {
			return false
		} else if (item.children) {
			item.children = filterTree(item.children)
		}
		return true
	})
}
