export default function apiService($http, $location) {
	const endPoint = "http://localhost:3000/";
	async function fetchGet(apiEndPoint, token = null, method = "GET") {
		var req = {
			method: method,
			url: endPoint + apiEndPoint,
			headers: {
				"Content-Type": "application/json",
			},
		};
		if (token) {
			req.headers["Authorization"] = "Bearer " + token;
		}
		let response = await $http(req);
		if (response.status == 401) {
			localStorage.clear();
			window.open("/");
			return;
		}
		return response.data;
	}

	async function fetchPost(apiEndPoint, token = null, body, method = "POST") {
		var req = {
			method: method,
			url: endPoint + apiEndPoint,
			headers: {
				"Content-Type": "application/json",
			},
			data: body,
		};
		if (token) {
			req.headers["Authorization"] = "Bearer " + token;
		}
		let response = await $http(req);
		if (response.status == 401) {
			localStorage.clear();
			window.open("/");
			return;
		}
		return response.data;
	}

	return {
		fetchGet: fetchGet,
		fetchPost: fetchPost,
	};
}
