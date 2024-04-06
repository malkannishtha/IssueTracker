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
		api.fetchPost("", undefined, { username: $scope.username, password: $scope.password }, undefined).then(
			(response) => {
				if (response.success) {
					localStorage.setItem(response.data.token);
					auth.login(response.data.token, response.data.username);
					$location.path("/home");
				} else {
					$scope.loading = false;
					$scope.error = response.message;
				}
			}
		);
	};

	$scope.toSignup = function () {
		$location.path("/signup");
	};

	if (auth.isAuthenticated()) {
		$location.path("/home");
	}
}
export default loginController;
