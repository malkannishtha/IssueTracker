export default function mainController($scope, $location, auth) {
	$scope.showHeaderFooter = true;
	$scope.username = "ayush";
	if (["/", "/signup"].includes($location.path())) {
		$scope.showHeaderFooter = false;
	}
	$scope.activeLink = function (link) {
		return $location.path() == link;
	};
	$scope.redirectTo = function (path) {
		$location.path(path);
	};
}
