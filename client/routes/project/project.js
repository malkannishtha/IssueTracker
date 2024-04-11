export default function projectController($scope, $location, auth, api, $mdDialog, $routeParams) {
	$scope.loading = true;
	$scope.errorMsg = "";
	$scope.projectId = $routeParams.projectId;
	$scope.project = {};
	$scope.activeView = "details";
	$scope.memberFields = [
		{ header: "Sr No." },
		{ header: "Username" },
		{ header: "Fullname" },
		{ header: "Todos" },
		{ header: "In Progress" },
		{ header: "Done" },
		{ header: "Expired" },
	];

	$scope.toggleView = function (view) {
		$scope.activeView = view;
	};

	$scope.fetchProject = function () {
		$scope.loading = true;
		api.fetchGet(`user/projects/${$scope.projectId}`, localStorage.getItem("token"))
			.then((response) => {
				$scope.$apply(() => {
					$scope.project = response.data.project;
				});
			})
			.catch((response) => {
				$scope.$apply(() => {
					$scope.errorMsg = response.data.message;
				});
			})
			.finally(() => {
				$scope.$apply(() => {
					$scope.loading = false;
				});
			});
	};

	$scope.addIssueModal = function (ev) {
		$mdDialog
			.show({
				controller: dialogController,
				templateUrl: "routes/project/add-issue.html",
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose: false,
				locals: {
					project: $scope.project,
				},
			})
			.then(
				function (answer) {
					if (answer) {
						$scope.fetchProject();
					}
				},
				function () {
					$scope.status = "You cancelled the dialog.";
				}
			);
	};

	$scope.fetchProject();

	function dialogController($scope, $mdDialog, project) {
		$scope.project = project;
		$scope.title = "";
		$scope.description = "";
		$scope.due_date = "";
		$scope.user_id = "";
		$scope.issueLoading = false;
		$scope.errorMsg = "";

		$scope.save = function () {
			if (
				!$scope.user_id ||
				!$scope.due_date ||
				new Date() >= new Date($scope.due_date) ||
				!$scope.description ||
				!$scope.title ||
				$scope.issueLoading
			)
				return;

			const body = {
				title: $scope.title,
				description: $scope.description,
				due_date: $scope.due_date,
				project_id: project._id,
				user_id: $scope.user_id,
			};

			$scope.issueLoading = true;

			api.fetchPost("user/issues", localStorage.getItem("token"), body)
				.then((response) => {
					$scope.$apply(() => {
						$scope.errorMsg = "";
						$mdDialog.hide(true);
					});
				})
				.catch((response) => {
					$scope.$apply(() => {
						$scope.errorMsg = response.data.message;
					});
				})
				.finally(() => {
					$scope.$apply(() => {
						$scope.issueLoading = false;
					});
				});
		};
		$scope.cancel = function () {
			$mdDialog.cancel();
		};
	}
}
