import angular from "angular";

function signupController($scope, $interval, $timeout, $location, auth, api) {
	$scope.loading = false;
	$scope.username = "";
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
		if (!$scope.loading) {
			$scope.loading = !$scope.loading;
		}
	};
	$scope.toLogin = function () {
		$location.path("/");
	};
}
export default signupController;
