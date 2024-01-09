document.addEventListener('DOMContentLoaded', function () {

  var nameValid = false;

  function nameValidation() {
    let input = document.getElementById("name");
    let nameError = document.getElementById('nameError');
    let name = input.value.trim();
    var pattern = /^[a-zA-Z\s]+$/;

    if (!name || name.length < 1 || name.length >= 50) {
      input.classList.remove("valid");
      input.classList.add("invalid");
      nameError.textContent = "Name must be between 1-50 characters."
      return (nameValid = false);
    } else if (!pattern.test(name)) {
      input.classList.remove("valid");
      input.classList.add("invalid");
      nameError.textContent = "Name can only contain letters."
      return (nameValid = false);
    } else {
      input.classList.remove("invalid");
      input.classList.add("valid");
      nameError.textContent = ""
      return (nameValid = true);
    }
  }

});