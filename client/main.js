import angular from "angular";
import "angular-animate";
import "angular-aria";
import "angular-messages";
import "angular-material";
import "angular-route";
import customButton from "./directives/custom-button/custom-button";
import loginController from "./routes/login/login";
import signupController from "./routes/signup/signup";
import authServive from "./services/authService";
import mainController from "./controllers/mainController";
import apiService from "./services/apiService";
import projectsController from "./routes/projects/projects";
import slice from "./filters/slice";
import projectController from "./routes/project/project";
import homeController from "./routes/home/home";

const appModule = angular
	.module("issue-tracker", ["ngAnimate", "ngAria", "ngMessages", "ngMaterial", "ngRoute"])
	.config(config);

//CONFIG----------------------------------------------------------------------------
config.$inject = ["$mdThemingProvider", "$routeProvider"];
function config($mdThemingProvider, $routeProvider) {
	$mdThemingProvider.theme("default").primaryPalette("purple").accentPalette("light-blue").warnPalette("red");
	$routeProvider
		.when("/", { templateUrl: "/routes/login/login.html", controller: "loginController" })
		.when("/signup", { templateUrl: "/routes/signup/signup.html", controller: "signupController" })
		.when("/home", { templateUrl: "/routes/home/home.html", controller: "homeController" })
		.when("/projects", { templateUrl: "/routes/projects/projects.html", controller: "projectsController" })
		.when("/project/:projectId", { templateUrl: "/routes/project/project.html", controller: "projectController" })
		.when("/error", { templateUrl: "/routes/error/error.html" })
		.otherwise("/error");
}

//SERVICES----------------------------------------------------------------------------
appModule.factory("auth", authServive);
appModule.factory("api", apiService);

apiService.$inject = ["$http", "$location"];
authServive.$inject = ["$location", "api"];

//DIRECTIVES----------------------------------------------------------------------------
appModule.directive("customButton", customButton);

//CONTROLLERS----------------------------------------------------------------------------
appModule.controller("mainController", mainController);
appModule.controller("loginController", loginController);
appModule.controller("signupController", signupController);
appModule.controller("homeController", homeController);
appModule.controller("projectsController", projectsController);
appModule.controller("projectController", projectController);
loginController.$inject = ["$scope", "$interval", "$timeout", "$location", "auth", "api"];
signupController.$inject = ["$scope", "$interval", "$timeout", "$location", "auth", "api"];
mainController.$inject = ["$scope", "$location", "auth", "$rootScope"];
homeController.$inject = ["$scope", "$location", "auth", "api", "$mdDialog"];
projectsController.$inject = ["$scope", "$location", "auth", "api", "$mdDialog"];
projectController.$inject = ["$scope", "$location", "auth", "api", "$mdDialog", "$routeParams"];

//FILTERS----------------------------------------------------------------------------
appModule.filter("slice", slice);

//EVENT-LISTENERS----------------------------------------------------------------------------
appModule.run(authGuard);
authGuard.$inject = ["$rootScope", "$location", "auth"];

function authGuard($rootScope, $location, auth) {
	$rootScope.$on("$routeChangeStart", function (event, next, current) {
		if (next.$$route && !["/", "/signup"].includes(next.$$route.originalPath)) {
			if (!auth.isAuthenticated()) {
				$location.path("/");
			}
		}
	});
}
