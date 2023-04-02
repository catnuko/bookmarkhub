import { BookMarks, MyBookMark } from "@/type"
import cloneDeep from "lodash/cloneDeep"
import { diffTree } from "./diffTree"

export default class DiffBookMark {
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