"use strict";
// const myImage = document.querySelector("img");
// myImage.onclick = function() {
//   const mySrc = myImage.getAttribute("src");
//   if (mySrc === "images/wallpaper/miku.jpg") {
//     myImage.setAttribute("src", "images/wallpaper/miku2.jpg");
//   } else {
//     myImage.setAttribute("src", "images/wallpaper/miku.jpg");
//   }
// };
let myButton = document.querySelector("button");
let myHeading = document.querySelector("h1");
function setUserName() {
    const myName = prompt("Please enter your name.", "no name");
    if (myName !== null) {
        localStorage.setItem("name", myName);
        if (myHeading !== null) {
            myHeading.textContent = `Mozilla is cool, ${myName}`;
        }
    }
}
// if (!localStorage.getItem("name")) {
//   setUserName();
// } else {
//   const storedName = localStorage.getItem("name");
//   myHeading.textContent = `Mozilla is cool, ${storedName}`;
// }
if (myButton !== null)
    myButton.onclick = function () {
        setUserName();
    };
