export default function homeController($scope, $location, auth, api, $mdDialog) {
	$scope.loading = true;
	$scope.statusfilter = "All";
	$scope.projectfilter = "All";
	$scope.issues = [];
	$scope.filteredIssues = [];
	$scope.projects = [];
	$scope.fields = [
		{ header: "Sr No.", field: "index" },
		{ header: "Issue Title", field: "title" },
		{ header: "Issue Description", field: "description" },
		{ header: "Status", field: "status" },
		{ header: "Project Title", field: "project" },
	];
	$scope.statuses = ["All", "TO-DO", "IN-PROGRESS", "DONE", "EXPIRED"];
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
	$scope.showDots = function (param, p2) {
		if (param.length > p2) {
			return "...";
		}
	};
	$scope.gotoProject = function (param) {
		$location.path("/project/" + param);
	};
	$scope.filterIssues = function (ev) {
		$scope.filteredIssues = $scope.issues.filter((ele) => {
			if ($scope.statusfilter == "All") {
				return true;
			} else {
				return $scope.status == ele.status;
			}
		});
		$scope.filteredIssues = $scope.filteredIssues.filter((ele) => {
			if ($scope.projectfilter == "All") {
				return true;
			} else {
				return $scope.project == ele.project;
			}
		});
	};

	$scope.getIssues = function () {
		$scope.loading = true;
		api.fetchGet("issues", localStorage.getItem("token"), undefined)
			.then((response) => {
				$scope.$apply(() => {
					$scope.issues = response.data.issues.map((ele, index) => ({
						...ele,
						index: index + 1,
						project: ele.project_id.title,
						project_id: ele.project_id._id,
						status: new Date(ele.due_date) < new Date() ? "EXPIRED" : ele.status,
					}));
					$scope.projects = Array.from(new Set($scope.issues.map((ele) => ele.project)));
					$scope.filteredIssues = $scope.issues;
				});
			})
			.catch(() => {})
			.finally(() => {
				$scope.$apply(() => {
					$scope.loading = false;
				});
			});
	};
	$scope.getIssues();
}
