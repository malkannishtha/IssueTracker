function loginController($scope, $interval, $timeout, $location, auth, api) {
	$scope.loading = false;
	$scope.username = "";
	$scope.password = "";
	$scope.errorMsg = "";

	$scope.onLogin = function () {
		angular.forEach($scope.loginForm.$error, function (controls, errorName) {
			angular.forEach(controls, function (control) {
				control.$setDirty();
			});
		});
		if ($scope.loginForm.$invalid) {
			return;
		}
		if ($scope.loading) {
			return;
		}

		$scope.loading = true;
		api.fetchPost("login", undefined, { username: $scope.username, password: $scope.password })
			.then((response) => {
				$scope.errorMsg = "";
				localStorage.setItem("token", response.data.token);
				auth.login(response.data.token, $scope.username);
				window.open("/", "_self");
			})
			.catch((response) => {
				$scope.errorMsg = response.data.message;
			})
			.finally(() => {
				$scope.loading = false;
			});
	};

	$scope.toSignup = function () {
		$location.path("/signup");
	};

	if (auth.isAuthenticated()) {
		$location.path("/home");
	}
}
export default loginController;
