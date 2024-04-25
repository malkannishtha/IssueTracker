export default function projectsController($scope, $location, auth, api, $mdDialog) {
	$scope.loading = true;
	$scope.fields = [
		{ header: "Sr No.", field: "index" },
		{ header: "Title", field: "title" },
		{ header: "Description", field: "description" },
		{ header: "Project Lead", field: "leader" },
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

	$scope.showModal = function (ev) {
		$mdDialog
			.show({
				controller: addProjectController,
				templateUrl: "routes/projects/add-project.html",
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose: false,
			})
			.then(
				function (answer) {
					if (answer) {
						$scope.getProjects();
					}
				},
				function () {
					$scope.status = "You cancelled the dialog.";
				}
			);
	};

	$scope.editProject = function (projectId, ev) {
		$mdDialog
			.show({
				controller: editProjectController,
				templateUrl: "routes/projects/add-project.html",
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose: false,
				locals: {
					project: $scope.projects.find((ele) => ele._id == projectId),
				},
			})
			.then(
				function (answer) {
					if (answer) {
						$scope.getProjects();
					}
				},
				function () {
					$scope.status = "You cancelled the dialog.";
				}
			);
	};

	$scope.showDots = function (param) {
		if (param.length > 200) {
			return "...";
		}
	};

	$scope.showEditDelete = function (param) {
		if (auth.getUsername() == param) {
			return true;
		}
		return false;
	};

	$scope.gotoProject = function (param) {
		$location.path("/project/" + param);
	};

	$scope.getProjects = function () {
		$scope.loading = true;
		api.fetchGet("projects", localStorage.getItem("token"), undefined)
			.then((response) => {
				$scope.$apply(() => {
					$scope.projects = response.data.projects.map((ele, index) => ({
						...ele,
						index: index + 1,
						leader: ele.leader_id?.username,
					}));
				});
			})
			.catch(() => {})
			.finally(() => {
				$scope.$apply(() => {
					$scope.loading = false;
				});
			});
	};
	$scope.deleteProject = function (projectId) {
		let con = confirm("Are you sure you want to delete this project?");
		if (!con) return;
		$scope.loading = true;
		api.fetchGet("projects/" + projectId, localStorage.getItem("token"), "DELETE")
			.then((response) => {
				if (response.success) {
					$scope.getProjects();
				}
			})
			.catch((response) => {
				alert(response.data.message);
			})
			.finally(() => {
				$scope.$apply(() => {
					$scope.loading = false;
				});
			});
	};
	$scope.getProjects();

	function addProjectController($scope, $mdDialog) {
		$scope.members = [];
		$scope.users = [];
		$scope.member = "";
		$scope.description = "";
		$scope.title = "";
		$scope.errorMsg = "";
		$scope.addLoading = false;
		$scope.onMemberChange = function () {
			if (!$scope.member) return;
			api.fetchGet(`users?query=${$scope.member}`, localStorage.getItem("token"))
				.then((response) => {
					$scope.$apply(() => {
						$scope.users = response.data.users;
					});
				})
				.catch(() => {});
		};
		$scope.selectMember = function (user) {
			if ($scope.members.find((ele) => ele.username == user.username)) return;
			$scope.members.push({ ...user, index: $scope.members.length + 1 });
			$scope.member = "";
		};
		$scope.removeMember = function (user) {
			$scope.members = $scope.members.filter((ele, ind) => ele._id != user);
		};

		$scope.addProject = function () {
			if ($scope.addLoading) return;

			const body = {
				title: $scope.title,
				description: $scope.description,
				members: $scope.members.map((ele) => ele._id),
			};
			$scope.addLoading = true;

			api.fetchPost("projects", localStorage.getItem("token"), body)
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
						$scope.addLoading = false;
					});
				});
		};

		$scope.fields = [
			{ header: "Sr No.", field: "index" },
			{ header: "Username", field: "username" },
		];
		$scope.cancel = function () {
			$mdDialog.cancel();
		};
	}
	function editProjectController($scope, $mdDialog, project) {
		$scope.members = project.members;
		$scope.users = [];
		$scope.member = "";
		$scope.description = project.description;
		$scope.title = project.title;
		$scope.errorMsg = "";
		$scope.addLoading = false;
		$scope.onMemberChange = function () {
			if (!$scope.member) return;
			api.fetchGet(`users?query=${$scope.member}`, localStorage.getItem("token"))
				.then((response) => {
					$scope.$apply(() => {
						$scope.users = response.data.users;
					});
				})
				.catch(() => {});
		};
		$scope.selectMember = function (user) {
			if ($scope.members.find((ele) => ele.username == user.username)) return;
			$scope.members.push({ ...user, index: $scope.members.length + 1 });
			$scope.member = "";
		};
		$scope.removeMember = function (userId) {
			$scope.members = $scope.members.filter((ele, ind) => ele._id != userId);
		};

		$scope.addProject = function () {
			if ($scope.addLoading) return;

			const body = {
				title: $scope.title,
				description: $scope.description,
				members: $scope.members.map((ele) => ele._id),
			};
			$scope.addLoading = true;

			api.fetchPost("projects/" + project._id, localStorage.getItem("token"), body, "PATCH")
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
						$scope.addLoading = false;
					});
				});
		};

		$scope.fields = [
			{ header: "Sr No.", field: "index" },
			{ header: "Username", field: "username" },
		];
		$scope.cancel = function () {
			$mdDialog.cancel();
		};
	}
}
