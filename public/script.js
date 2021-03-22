//Event listeners for all relevant DOM components
const $hiddenInput = document.querySelector("textarea");
const $button = document.getElementById("button");
const $drawing_canvas = document.getElementById("signature");
//Link to getContext documentation: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
const canvasContext = $drawing_canvas.getContext("2d");

//Link to lineWidth documentation: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineWidth
canvasContext.lineWidth = 2;
//Link to offset width documentation: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetWidth
canvasContext.canvas.width = $drawing_canvas.offsetWidth;
//Link to offsetHeight  documentation: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetHeight
canvasContext.canvas.height = $drawing_canvas.offsetHeight;

//Defining a default/starting point for the mpouse cursor in x and y coords.
let cursorPosition = { x: -1, y: -1 };

//Here the function defines where the cursor is relative to the canvas. Test function of this topic at the bottom of this file.
//MouseEvent.clientX documentation: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/clientX
function cursorcursorPosition({ clientX, clientY }) {
    return {
        x: clientX - $drawing_canvas.offsetLeft,
        y: clientY - $drawing_canvas.offsetTop,
    };
}

//Main event Listener, handles mouse movement.
$drawing_canvas.addEventListener("mousemove", (event) => {
    //MouseEvent.button documentation: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
    if (event.buttons !== 1) {
        return;
    }
    //Saving cursor position
    const currentcursorPosition = cursorcursorPosition(event);

    //CanvasRenderingContext2D.beginPath() documentation: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/beginPath
    //Line 37 basically starts the marking of a new line.
    canvasContext.beginPath();
    //This line checks where the cursor is at this point. Since -1 is a not valid result for
    //neither of the cursorPosition properties, this checks if a mousemove event has ocurred
    if (cursorPosition.x == -1 && cursorPosition.y == -1) {
        //CanvasRenderingContext2D.moveTo() documentation: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/moveTo
        canvasContext.moveTo(currentcursorPosition.x, currentcursorPosition.y);
    } else {
        canvasContext.moveTo(cursorPosition.x, cursorPosition.y);
    }
    //updates cursor position
    cursorPosition = currentcursorPosition;
    //The next line moves the line of the drawing to the current cursor position
    //CanvasRenderingContext2D.lineTo() documentation
    canvasContext.lineTo(cursorPosition.x, cursorPosition.y);
    //Stroke() draws the line of the programmed shape.
    //Drawing with Canvas documentation https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes
    canvasContext.stroke();
});

$drawing_canvas.addEventListener("mouseup", (event) => {
    //CanvasRenderingContext2D.closePath() documentation: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/closePath
    canvasContext.closePath();
    //Takes the cursor to original position after mouseup
    cursorPosition.x = -1;
    cursorPosition.y = -1;
    saveMouseDataInHiddenInput();
});

//mouseleave event documentation: https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseleave_event
$drawing_canvas.addEventListener("mouseleave", (event) => {
    canvasContext.closePath();
    cursorPosition.x = -1;
    cursorPosition.y = -1;
});

//This function saves the cursor stroke history into a string and puts it into the $hiddenInput <textarea> value
//to later be recovered in the POST route to /petition and ultimately saved in the DDBB
function saveMouseDataInHiddenInput() {
    //HTMLCanvasElement.toDataURL() documentation: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL
    const dataURL = $drawing_canvas.toDataURL();
    $hiddenInput.value = dataURL;
}

//Good way to check MouseEvent.clientX in Action. Use the following HTML in your index.html
// HTML:
//     <p>Move your mouse to see its position.</p>
//     <p id="screen-log"></p>
// Javascript:
// let screenLog = document.querySelector("#screen-log");
// document.addEventListener("mousemove", logKey);
// function logKey(e) {
//     screenLog.innerText = `
//     Screen X/Y: ${e.screenX}, ${e.screenY}
//     Client X/Y: ${e.clientX}, ${e.clientY}`;
// }

//Good way of understanding beginPath, moveTo, lineTo and Stroke() methods
// var ctx = $drawing_canvas.getContext("2d");
// ctx.beginPath();
// ctx.moveTo(50, 50); // Begin first sub-path
// ctx.lineTo(200, 50);
// ctx.moveTo(50, 90); // Begin second sub-path
// ctx.lineTo(280, 120);
// ctx.stroke();
