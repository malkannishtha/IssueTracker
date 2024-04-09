export default function projectsController($scope, $interval, $timeout, $location, auth, api) {
	$scope.loading = true;
	$scope.fields = [
		{ header: "Sr No.", field: "index" },
		{ header: "Title", field: "title" },
		{ header: "Description", field: "description" },
		{ header: "Project Lead", field: "leader_id" },
	];
	$scope.projects = [];
	$scope.orderBy = "";
	$scope.sortBy = function (field) {
		if (!$scope.orderBy) {
			$scope.orderBy = field;
		} else if ($scope.orderBy == field) {
			$scope.orderBy = "-" + $scope.orderBy;
		} else if ($scope.orderBy.slice(1) == field) {
			$scope.orderBy = "";
		} else {
			$scope.orderBy = field;
		}
	};

	api.fetchGet("user/projects", localStorage.getItem("token"), undefined)
		.then((response) => {
			$scope.$apply(() => {
				$scope.projects = response.data.projects.map((ele, index) => ({ ...ele, index: index + 1 }));
			});
		})
		.catch(() => {})
		.finally(() => {
			$scope.$apply(() => {
				$scope.loading = false;
			});
		});
}
