let state = true;
chrome.storage.sync.get(["uiDivState"], function (result) {
	if (result.uiDivState !== undefined) {
		state = result.uiDivState;
	}
	if (!state) {
		document.getElementById("toggleUiDiv").classList.remove("active");
	} else {
		document.getElementById("toggleUiDiv").classList.add("active");
	}
});

document.addEventListener("DOMContentLoaded", function () {
	const toggleButton = document.getElementById("toggleUiDiv");

	toggleButton.addEventListener("click", function () {
		toggleButton.classList.toggle("active");
		console.log("clicked");
		state = !state; // Toggle state
		chrome.storage.sync.set({ uiDivState: state });
	});
});
