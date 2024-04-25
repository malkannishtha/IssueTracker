export default function mainController($scope, $location, auth, $rootScope, $mdMenu) {
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

	$scope.logout = function () {
		localStorage.clear();
		window.open("/", "_self");
	};

	$scope.activeLink = function (link) {
		if (link == "/projects") {
			return $location.path().includes("project");
		} else {
			return $location.path() == link;
		}
	};
	$scope.redirectTo = function (path) {
		$location.path(path);
	};
}
