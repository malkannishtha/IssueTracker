import angular from "angular";
import "angular-animate";
import "angular-aria";
import "angular-messages";
import "angular-material";
import "angular-route";
import customButton from "./directives/custom-button/custom-button";
import loginController from "./routes/login/login";
import signupController from "./routes/signup/signup";
const appModule = angular
	.module("issue-tracker", ["ngAnimate", "ngAria", "ngMessages", "ngMaterial", "ngRoute"])
	.config(config);

//config
config.$inject = ["$mdThemingProvider", "$routeProvider"];
function config($mdThemingProvider, $routeProvider) {
	$mdThemingProvider.theme("default").primaryPalette("purple").accentPalette("light-blue").warnPalette("red");
	$routeProvider
		.when("/", { templateUrl: "/routes/login/login.html", controller: loginController })
		.when("/signup", { templateUrl: "/routes/signup/signup.html", controller: signupController })
		.otherwise("/");
}

//directives
appModule.directive("customButton", customButton);

//controllers
loginController.$inject = ["$scope", "$interval", "$timeout", "$route", "$location", "$http"];
signupController.$inject = ["$scope", "$interval", "$timeout", "$route", "$location", "$http"];
