// Create a div element to contain the UI
const uiDiv = document.createElement("div");
uiDiv.id = "myExtensionUi";
Object.assign(uiDiv.style, {
    position: "fixed",
    top: "15%",
    right: "0",
    zIndex: "9999",
    backgroundColor: "#ffffff",
    transform: "translateY(-15%)",
    borderRadius: "1rem",
    width: "280px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: ".3rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    fontFamily: "'Arial', sans-serif",
    transition: "all 0.3s ease"
});
uiDiv.onclick = (e) => e.stopPropagation();
chrome.storage.sync.get(["uiDivPosition"], function (result) {
    console.log(result);
    if (result.uiDivPosition !== undefined) {
        uiDiv.style.top = result.uiDivPosition.top + "%";
        uiDiv.style.right = result.uiDivPosition.right + "%";
    }
}
);

// Create a button within the div to toggle the select tool
const selectButton = document.createElement("button");
selectButton.id = "selectTool";
selectButton.textContent = "Sélectionner une question";

Object.assign(selectButton.style, {
    border: "none",
    borderRadius: "2rem",
    padding: "0.75rem 1.25rem",
    background: "#3498db",
    color: "white",
    fontFamily: "inherit",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s, transform 0.1s",
    width: "100%",
    textAlign: "center"
});

selectButton.addEventListener("mouseover", () => selectButton.style.backgroundColor = "#2980b9");
selectButton.addEventListener("mouseout", () => selectButton.style.backgroundColor = "#3498db");
selectButton.addEventListener("mousedown", () => selectButton.style.transform = "scale(0.98)");
selectButton.addEventListener("mouseup", () => selectButton.style.transform = "scale(1)");

// Create a div to display the question
const questionDiv = document.createElement("div");
questionDiv.id = "question";
Object.assign(questionDiv.style, {
    display: "block",
    textAlign: "center",
    backgroundColor: "#ecf0f1",
    border: "1px solid #bdc3c7",
    borderRadius: "0.5rem",
    padding: "1rem",
    marginTop: "1rem",
    width: "100%",
    minHeight: "60px",
    color: "#2c3e50",
    fontSize: "14px",
    boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)"
});

let dynamicDocument = document;

// Create a div to display the answer
const answerDiv = document.createElement("div");
answerDiv.id = "answer";
Object.assign(answerDiv.style, {
    display: "block",
    textAlign: "center",
    backgroundColor: "#e8f6f3",
    border: "1px solid #a3e4d7",
    borderRadius: "0.5rem",
    padding: "1rem",
    marginTop: "1rem",
    width: "100%",
    minHeight: "60px",
    color: "#27ae60",
    fontSize: "14px",
    fontWeight: "bold"
});

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

// Scorm mode toggle
const scormButton = document.createElement("button");
let isScorm = false;
scormButton.id = "questionButton";
scormButton.textContent = "Scorm mode desactivé";
Object.assign(scormButton.style, {
    border: "none",
    borderRadius: "2rem",
    padding: "0.75rem 1.25rem",
    background: "#e74c3c",
    color: "white",
    fontFamily: "inherit",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s, transform 0.1s",
    width: "100%",
    textAlign: "center",
    marginTop: "1rem"
});

scormButton.addEventListener("click", function () {
    isScorm = !isScorm;
    if (isScorm) {
        scormButton.style.backgroundColor = "#27ae60";
        scormButton.textContent = "Scorm mode activé";
        const scorm = document.getElementById("scorm_object");
        if (scorm?.contentDocument) {
            dynamicDocument = scorm.contentDocument;
        } else {
            console.error("Scorm object or content document not found");
            isScorm = false;
            scormButton.style.backgroundColor = "#e74c3c";
            scormButton.textContent = "Scorm mode désactivé (Erreur)";
        }
    } else {
        scormButton.style.backgroundColor = "#e74c3c";
        scormButton.textContent = "Scorm mode désactivé";
        dynamicDocument = document;
    }
    updateEventListeners();
});

uiDiv.appendChild(scormButton);

let isHidden = false;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.command === "hide_ui") {
        if (uiDiv) {
            uiDiv.style.display = isHidden ? "flex" : "none";
        }
        isHidden = !isHidden;
    }
});

const buttonHideUi = document.createElement("button");
buttonHideUi.id = "hideUi";
buttonHideUi.textContent = "Hide";
buttonHideUi.style.border = "none";
buttonHideUi.style.position = "absolute";
buttonHideUi.style.bottom = "10px";
buttonHideUi.style.left = "10px";
buttonHideUi.style.backgroundColor = "transparent";
buttonHideUi.style.fontSize = "10px";
buttonHideUi.onclick = () => {
    if (isHidden) {
        uiDiv.style.display = "flex";
    } else {
        uiDiv.style.display = "none";
    }
    console.log("clicked");
    isHidden = !isHidden;
};

document.body.appendChild(buttonHideUi);

function handleClick(event) {
    if (!selectToolActive) return;

    const element = event.target;
    element.style.outline = "2px solid green";

    const questionText = element.innerText;
    console.log("Selected question:", questionText);

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
            findAndClick(dynamicDocument.body, response);
        });
    });

    // Deactivate the select tool
    toggleSelectTool();
}

let lastHovered = null;

function handleMouseMove(event) {
    if (!selectToolActive) return;
    
    const element = dynamicDocument.elementFromPoint(event.clientX, event.clientY);
    
    if (element !== lastHovered) {
        if (lastHovered) lastHovered.style.outline = '';
        if (element) element.style.outline = '2px solid red';
        lastHovered = element;
    }
}

function cleanupSelectTool() {
    if (lastHovered) {
        lastHovered.style.outline = '';
        lastHovered = null;
    }
}

function updateEventListeners() {
    // Remove existing event listeners
    document.removeEventListener("click", handleClick);
    document.removeEventListener("mousemove", handleMouseMove);
    
    // Add event listeners to the appropriate document
    dynamicDocument.addEventListener("click", handleClick);
    dynamicDocument.addEventListener("mousemove", handleMouseMove);
}

// Initial setup of event listeners
updateEventListeners();