export default function slice() {
	return function (arr, start, end) {
		if (!end) {
			return arr.slice(0, start);
		} else {
			return arr.slice(start, end);
		}
	};
}
