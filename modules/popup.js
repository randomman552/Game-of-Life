/**
 * Toggle the popup with the given ID.
 * @param ID {string}
 */
function togglePopup(ID) {
    document.getElementById(ID).parentElement.classList.toggle("open");
}
