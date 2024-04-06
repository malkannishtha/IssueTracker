export default function customButton() {
	return {
		scope: {
			loading: "=",
			name: "@",
			class: "@",
			parentClass: "@",
			onClick: "&",
		},
		// template: "<h1 class='text-bold'>ABC</h1>",
		templateUrl: "/directives/custom-button/custom-button.html",
	};
}
