export default function authServive($location, api) {
	let username = "";
	let token = "";

	function isAuthenticated() {
		if (localStorage.getItem("token")) {
			return true;
		}
		return false;
	}

	function login(tokenRes, usernameRes) {
		localStorage.setItem("token", tokenRes);
		username = usernameRes;
		token = tokenRes;
	}

	async function verify() {
		token = localStorage.getItem("token");
		if (!token) {
			logout();
			return;
		}
		const promise = await new Promise((resolve, reject) => {
			api.fetchGet("verify", localStorage.getItem("token"), undefined)
				.then((response) => {
					resolve(response.data.username);
				})
				.catch(() => {
					localStorage.clear();
					window.open("/", "_self");
				});
		});
		username = promise;
		return username;
	}

	function logout() {
		localStorage.clear();
		window.open("/", "_self");
	}

	function getToken() {
		return token;
	}

	function getUsername() {
		return username;
	}

	return {
		login: login,
		verify: verify,
		logout: logout,
		isAuthenticated: isAuthenticated,
		getToken: getToken,
		getUsername: getUsername,
		username,
	};
}
