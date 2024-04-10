export default function projectsController($scope, $interval, $timeout, $location, auth, api, $mdDialog) {
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
				controller: dialogController,
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

	$scope.getProjects = function () {
		$scope.loading = true;
		api.fetchGet("user/projects", localStorage.getItem("token"), undefined)
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
	$scope.getProjects();

	function dialogController($scope, $mdDialog) {
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
			$scope.members = $scope.members
				.filter((ele, ind) => ele.index != user)
				.map((ele, ind) => ({ ...ele, index: ind + 1 }));
		};

		$scope.addProject = function () {
			const body = {
				title: $scope.title,
				description: $scope.description,
				members: $scope.members.map((ele) => ele._id),
			};
			$scope.addLoading = true;

			console.log($scope);
			api.fetchPost("user/projects", localStorage.getItem("token"), body)
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
