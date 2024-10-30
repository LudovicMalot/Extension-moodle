let state = true;
let uiDivPosition = { top: 15, right: 0 };

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

chrome.storage.sync.get(["uiDivPosition"], function (result) {
	if (result.uiDivPosition !== undefined) {
		uiDivPosition = result.uiDivPosition;
	}
	const topInput = document.getElementById("top");
	const rightInput = document.getElementById("right");
	topInput.value = uiDivPosition.top;
	rightInput.value = uiDivPosition.right;
});

document.addEventListener("DOMContentLoaded", function () {
	const toggleButton = document.getElementById("toggleUiDiv");
	const saveButton = document.getElementById("save");
	const topInput = document.getElementById("top");
	const rightInput = document.getElementById("right");

	toggleButton.addEventListener("click", function () {
		toggleButton.classList.toggle("active");
		state = !state; // Toggle state
		chrome.storage.sync.set({ uiDivState: state });
	});

	saveButton.addEventListener("click", function () {
		const newTop = parseFloat(topInput.value);
		const newRight = parseFloat(rightInput.value);
		this.classList.add("clicked");
		setTimeout(() => {
			this.classList.remove("clicked");
		}, 1000);

		if (!isNaN(newTop) && !isNaN(newRight)) {
			uiDivPosition = { top: newTop, right: newRight };
			chrome.storage.sync.set({ uiDivPosition: uiDivPosition }, function () {});
		} else {
			alert("Veuillez entrer des valeurs numériques valides pour la position.");
		}
	});
});
