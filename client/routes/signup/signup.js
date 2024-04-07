import angular from "angular";

function signupController($scope, $interval, $timeout, $location, auth, api) {
	$scope.loading = false;
	$scope.username = "";
	$scope.fullname = "";
	$scope.email = "";
	$scope.password = "";
	$scope.onSignup = function () {
		angular.forEach($scope.signupForm.$error, function (controls, errorName) {
			angular.forEach(controls, function (control) {
				control.$setDirty();
			});
		});
		if ($scope.signupForm.$invalid) {
			return;
		}
		if ($scope.loading) {
			return;
		}
		$scope.loading = true;
		api.fetchPost("signup", undefined, {
			username: $scope.username,
			password: $scope.password,
			fullname: $scope.fullname,
			email: $scope.email,
		})
			.then((response) => {
				$scope.errorMsg = "";
				localStorage.setItem("token", response.data.token);
				auth.login(response.data.token, response.data.username);
				$location.path("/home");
			})
			.catch((response) => {
				$scope.errorMsg = response.data.message;
			})
			.finally(() => {
				$scope.loading = false;
			});
	};
	$scope.toLogin = function () {
		$location.path("/");
	};
}
export default signupController;
