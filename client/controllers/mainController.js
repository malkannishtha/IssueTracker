export default function mainController($scope, $location, auth, $rootScope) {
	$scope.showHeaderFooter = false;
	$scope.username = "";
	if (auth.isAuthenticated()) {
		if (auth.getUsername()) {
			$scope.$apply(() => {
				$scope.username = auth.getUsername();
			});
		} else {
			auth.verify().then((username) => {
				$scope.$apply(() => {
					$scope.username = username;
				});
			});
		}
	}
	$rootScope.$on("$locationChangeSuccess", function (event) {
		if (["/", "/signup"].includes($location.path())) {
			$scope.showHeaderFooter = false;
		} else {
			$scope.showHeaderFooter = true;
		}
	});

	$scope.activeLink = function (link) {
		return $location.path() == link;
	};
	$scope.redirectTo = function (path) {
		$location.path(path);
	};
}
