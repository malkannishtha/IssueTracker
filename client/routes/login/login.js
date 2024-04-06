function loginController($scope, $interval, $timeout, $route, $location, $http) {
	$scope.loading = false;
	$scope.username = "";
	$scope.password = "";
	$scope.onLogin = function () {
		angular.forEach($scope.loginForm.$error, function (controls, errorName) {
			angular.forEach(controls, function (control) {
				control.$setDirty();
			});
		});
		if ($scope.loginForm.$invalid) {
			return;
		}
		if (!$scope.loading) {
			$scope.loading = true;
			$timeout(() => {
				$scope.loading = false;
			}, 3000);
		}
	};
	$scope.toSignup = function () {
		$location.path("/signup");
	};
}
export default loginController;
