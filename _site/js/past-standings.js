// Buttons for filtering divisions
filterSelection("all")

var btnContainer = document.getElementById("myBtnContainer");
var btns = btnContainer.getElementsByClassName("btn");
for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function(){
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
    });
}

// Modals for table results within a division
// Get the modal
var modal = document.getElementsByClassName('myModal');

// Get the button that opens the modal
var btn = document.getElementsByClassName("results-button");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close");

window.onclick = function(event) {
    for (let j = 0; j < btn.length; j++) {
        if (event.target == modal[j]) {
            modal[j].style.display = "none";
        }
    }
}

for (let j = 0; j < btn.length; j++) {
    // When the user clicks the button, open the modal
    btn[j].onclick = function() {
        modal[j].style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span[j].onclick = function() {
        modal[j].style.display = "none";
    }
}
