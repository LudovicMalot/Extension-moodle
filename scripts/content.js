// Create a div element to contain the UI
const uiDiv = document.createElement("div");
uiDiv.id = "myExtensionUi";
uiDiv.style.position = "fixed";
uiDiv.style.top = "15%";
uiDiv.style.right = "0";
uiDiv.style.zIndex = "9999";
uiDiv.style.backgroundColor = "white";
uiDiv.style.transformY = "-15%";
uiDiv.style.borderRadius = "2rem";
uiDiv.style.width = "260px";
uiDiv.style.padding = "1rem";
uiDiv.style.display = "flex";
uiDiv.style.flexDirection = "column";
uiDiv.style.alignItems = "center";
uiDiv.style.justifyContent = "center";
uiDiv.style.gap = "1rem";

// Create a button within the div to toggle the select tool
const selectButton = document.createElement("button");
selectButton.id = "selectTool";
selectButton.textContent = "Sélectionner une question";

// Updated Styling
selectButton.style.border = "none";
selectButton.style.borderRadius = "2rem";
selectButton.style.padding = ".5rem 1rem";
selectButton.style.background = "#007bff";
selectButton.style.color = "white";
selectButton.style.fontFamily = "'Helvetica', 'Arial', sans-serif";
selectButton.style.fontSize = "16px";
selectButton.style.cursor = "pointer";
selectButton.style.transition = "background-color 0.3s, color 0.3s";
selectButton.style.width = "220px";

// Hover effect
selectButton.addEventListener("mouseover", function () {
	this.style.backgroundColor = "#0056b3";
});

selectButton.addEventListener("mouseout", function () {
	this.style.backgroundColor = "#007bff";
});

// Create a div to display the question
const questionDiv = document.createElement("div");
questionDiv.id = "answer";
questionDiv.style.display = "block";
questionDiv.style.textAlign = "center";
questionDiv.style.backgroundColor = "#f9f9f9";
questionDiv.style.border = "1px solid #ccc";
questionDiv.style.borderRadius = ".5rem";
questionDiv.style.fontFamily = "'Helvetica', 'Arial', sans-serif";
questionDiv.style.color = "#333";
questionDiv.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.1)";

// Create a div to display the answer
const answerDiv = document.createElement("div");
answerDiv.id = "answer";
answerDiv.style.display = "block";
answerDiv.style.textAlign = "center";

// Append elements to the UI div
uiDiv.appendChild(selectButton);
uiDiv.appendChild(questionDiv);
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
		questionDiv.innerHTML = response.question;
		let responses = response.data.split(",");
		// Recursive function to traverse DOM tree
		function findAndClick(element, searchText) {
			if (element.childNodes.length > 0) {
				element.childNodes.forEach((child) => findAndClick(child, searchText));
			} else if (element.nodeType === Node.TEXT_NODE) {
				// Convert the nodeValue and searchText to lowercase for case-insensitive matching
				let nodeValueLower = element.nodeValue.toLowerCase();
				let searchTextLower = searchText.toLowerCase();

				if (nodeValueLower == searchTextLower) {
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
