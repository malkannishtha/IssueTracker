import angular from "angular";
import "angular-animate";
import "angular-aria";
import "angular-messages";
import "angular-material";
import "angular-route";
import customButton from "./directives/custom-button/custom-button";
const appModule = angular.module("issue-tracker", ["ngAnimate", "ngAria", "ngMessages", "ngMaterial", "ngRoute"]).config(function ($mdThemingProvider) {
	$mdThemingProvider.theme("default").primaryPalette("indigo").accentPalette("light-blue").warnPalette("red");
});

//directives
appModule.directive("customButton", customButton);

//controllers
appModule.controller("ABC", [
	"$scope",
	"$interval",
	function ($scope, $interval) {
		$scope.loading = false;
		$interval(() => {
			$scope.loading = !$scope.loading;
		}, 1000);
	},
]);
