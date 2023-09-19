// Create a div element to contain the UI
const uiDiv = document.createElement("div");
uiDiv.id = "myExtensionUi";
uiDiv.style.position = "fixed";
uiDiv.style.top = "50%";
uiDiv.style.right = "0";
uiDiv.style.zIndex = "9999";
uiDiv.style.backgroundColor = "white";
uiDiv.style.transformY = "-50%";
uiDiv.style.borderRadius = "2rem";
uiDiv.style.width = "240px";
uiDiv.style.padding = "1rem";
uiDiv.style.display = "flex";
uiDiv.style.flexDirection = "column";
uiDiv.style.alignItems = "center";
uiDiv.style.justifyContent = "center";

// Create a button within the div to toggle the select tool
const selectButton = document.createElement("button");
selectButton.id = "selectTool";
selectButton.textContent = "Selectionner une question";
selectButton.style.border = "1px solid black";
selectButton.style.borderRadius = "2rem";

// Create a div to display the answer
const answerDiv = document.createElement("div");
answerDiv.id = "answer";
answerDiv.style.display = "block";

// Append elements to the UI div
uiDiv.appendChild(selectButton);
uiDiv.appendChild(answerDiv);
uiDiv.style.display = "none";
// Append the UI div to the body of the web page
document.body.appendChild(uiDiv);

chrome.storage.sync.get(["uiDivState"], function (result) {
	if (result.uiDivState !== undefined) {
		if (result.uiDivState) {
			uiDiv.style.display = "flex";
		} else {
			uiDiv.style.display = "none";
		}
	}
});

let selectToolActive = false;
const toggleSelectTool = () => {
	selectToolActive = !selectToolActive; // Toggle the state
	if (selectToolActive) {
		document.getElementById("selectTool").textContent = "Cancel";
		document.body.style.cursor = "crosshair";
	} else {
		document.getElementById("selectTool").textContent = "Selectionner une question";
		document.body.style.cursor = "default";
	}
};
document.getElementById("selectTool").addEventListener("click", function (e) {
	e.stopPropagation(); // Prevent the click from bubbling to the document
	e.preventDefault(); // Prevent the default action of the button
	toggleSelectTool();
});

// Overlay style
const overlay = document.createElement("div");
overlay.style.position = "absolute";
overlay.style.border = "2px solid red";
overlay.style.pointerEvents = "none"; // To ensure click events go through the overlay
document.body.appendChild(overlay);

document.addEventListener("mousemove", function (event) {
	if (!selectToolActive) return;

	const element = document.elementFromPoint(event.clientX, event.clientY);

	if (element) {
		const rect = element.getBoundingClientRect();
		overlay.style.left = rect.left + "px";
		overlay.style.top = rect.top + "px";
		overlay.style.width = rect.width + "px";
		overlay.style.height = rect.height + "px";
	}
});

document.addEventListener("click", function (event) {
	if (!selectToolActive) return;

	const element = event.target;

	const questionText = element.innerText;
	console.log(questionText);

	chrome.runtime.sendMessage({ type: "get-response-data", data: questionText }, (response) => {
		answerDiv.innerHTML = response.data;
		let responses = response.data.split(",");
		console.log(responses);
		// Recursive function to traverse DOM tree
		function findAndClick(element, searchText) {
			if (element.childNodes.length > 0) {
				element.childNodes.forEach((child) => findAndClick(child, searchText));
			} else if (element.nodeType === Node.TEXT_NODE) {
				// Convert the nodeValue and searchText to lowercase for case-insensitive matching
				let nodeValueLower = element.nodeValue.toLowerCase();
				let searchTextLower = searchText.toLowerCase();

				// Define regex for whole word/phrase match
				let regex = new RegExp(`\\b${searchTextLower}\\b`);

				if (nodeValueLower == searchTextLower) {
					console.log(nodeValueLower == searchTextLower);
					// Simulate a click event with propagation
					let event = new MouseEvent("click", {
						bubbles: true,
						cancelable: true,
					});
					element.parentNode.dispatchEvent(event);
				}
			}
		}

		responses.forEach((response) => {
			// Trim any white spaces around the text
			response = response.trim();

			// Start from the body and look for elements containing the response text
			findAndClick(document.body, response);
		});
	});

	// Deactivate the select tool
	toggleSelectTool();
	overlay.style.width = "0px";
	overlay.style.height = "0px";
});
