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

	function verify() {
		token = localStorage.getItem("token");
		if (!token) {
			logout();
			return;
		}
		api.fetchGet("verify", localStorage.getItem("token"), undefined)
			.then((data) => {
				username = data.username;
			})
			.catch(() => {
				logout();
			});
	}

	function logout() {
		localStorage.clear();
		$location.path("/");
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
	};
}
