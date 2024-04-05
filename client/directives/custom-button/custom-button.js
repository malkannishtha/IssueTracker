export default function customButton() {
	return {
		scope: {
			loading: "=",
			name: "@",
			class: "@",
		},
		// template: "<h1 class='text-bold'>ABC</h1>",
		templateUrl: "/directives/custom-button/custom-button.html",
	};
}
