export default function projectController($scope, $location, auth, api, $mdDialog, $routeParams) {
	$scope.loading = true;
	$scope.username = auth.getUsername();
	$scope.errorMsg = "";
	$scope.projectId = $routeParams.projectId;
	$scope.project = {};
	$scope.issues = [];
	$scope.members = [];
	$scope.activeView = "issues";
	$scope.statuses = ["TO-DO", "IN-PROGRESS", "DONE", "EXPIRED"];
	$scope.memberFields = [
		{ header: "Sr No." },
		{ header: "Username" },
		{ header: "Fullname" },
		{ header: "TO-DO" },
		{ header: "IN-PROGRESS" },
		{ header: "DONE" },
		{ header: "EXPIRED" },
	];

	$scope.toggleView = function (view) {
		$scope.activeView = view;
	};

	$scope.getIssueCount = function (member, status) {
		let count = 0;
		$scope.issues.forEach((ele) => {
			if (ele.user_id == member) {
				if (ele.status == status && status != "EXPIRED") {
					count++;
				} else if (status == "EXPIRED" && new Date() > new Date(ele.due_data)) {
					count++;
				}
			}
		});
		return count;
	};
	$scope.getIssues = function (status) {
		return $scope.issues.filter((ele) => ele.status == status);
	};
	$scope.formatDate = function (date) {
		return new Date(date).toLocaleDateString();
	};
	$scope.getUser = function (userId) {
		return $scope.members.find((ele) => ele._id == userId);
	};

	$scope.fetchProject = function () {
		$scope.loading = true;
		api.fetchGet(`projects/${$scope.projectId}`, localStorage.getItem("token"))
			.then((response) => {
				$scope.$apply(() => {
					$scope.project = response.data.project;
					$scope.issues = response.data.issues.map((ele) => {
						if (new Date(ele.due_date) < new Date()) {
							ele.status = "EXPIRED";
						}
						return ele;
					});
					$scope.members = [...$scope.project.members];
					$scope.members.push({ ...$scope.project.leader_id });
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
				controller: addIssueController,
				templateUrl: "routes/project/add-issue.html",
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose: false,
				locals: {
					project: $scope.project,
					members: $scope.members,
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

	$scope.viewIssueModal = function (issue, ev) {
		$mdDialog
			.show({
				controller: viewIssueController,
				templateUrl: "routes/project/view-issue.html",
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose: false,
				locals: {
					project: $scope.project,
					members: $scope.members,
					issue: issue,
					username: $scope.username,
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

	function addIssueController($scope, $mdDialog, project, members) {
		$scope.project = project;
		$scope.members = members;
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

			api.fetchPost("issues", localStorage.getItem("token"), body)
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

	function viewIssueController($scope, $mdDialog, project, members, issue, username) {
		$scope.project = project;
		$scope.members = members;
		$scope.userId = members.find((ele) => ele.username == username)["_id"];
		$scope.title = issue.title;
		$scope.description = issue.description;
		$scope.due_date = new Date(issue.due_date);
		$scope.user_id = issue.user_id;
		$scope.created_by = issue.created_by;
		$scope.status = issue.status;
		$scope.statuses = ["TO-DO", "IN-PROGRESS", "DONE"];
		$scope.issueLoading = false;
		$scope.errorMsg = "";

		$scope.hasPermission = function (isStatus) {
			if (issue.created_by == $scope.userId) {
				return false;
			} else if (issue.user_id == $scope.userId && isStatus) {
				return false;
			}
		};

		$scope.getUser = function (userId) {
			return members.find((ele) => ele._id == userId).fullname;
		};

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
				status: $scope.status,
			};

			$scope.issueLoading = true;

			api.fetchPost("issues/" + issue._id, localStorage.getItem("token"), body, "PATCH")
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

		$scope.delete = function () {
			api.fetchGet("issues/" + issue._id, localStorage.getItem("token"), "DELETE")
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
