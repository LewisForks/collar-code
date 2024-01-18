document.addEventListener('DOMContentLoaded', function () {

  function nameValidation() {
    let input = document.getElementById("name");
    let name = input.value.trim();
    var pattern = /^[a-zA-Z\s]+$/;

    if (!name || name.length < 1 || name.length >= 50) {
      input.classList.remove("valid");
      input.classList.add("invalid");
      return (nameValid = false);
    } else if (!pattern.test(name)) {
      input.classList.remove("valid");
      input.classList.add("invalid");
      return (nameValid = false);
    } else {
      input.classList.remove("invalid");
      input.classList.add("valid");
      return (nameValid = true);
    }
  }

  function emailValidation() {
    let input = document.getElementById("email");
    let email = input.value.trim();
    var pattern = /^[^ ]+@[^ ]+\.[a-z]{2,7}$/;

    if (!email) {
      input.classList.remove("valid");
      input.classList.add("invalid");
      return (emailValid = false);
    } else if (!pattern.test(email)) {
      input.classList.remove("valid");
      input.classList.add("invalid");
      return (emailValid = false);
    } else {
      input.classList.remove("invalid");
      input.classList.add("valid");
      return (emailValid = true);
    }
  }

  function passwordValidation() {
    let input = document.getElementById("password");
    let password = input.value;

    if (!password || password.length < 8) {
      input.classList.remove("valid");
      input.classList.add("invalid");
      return (passwordValid = false);
    } else if (password.length > 32) {
      input.classList.remove("valid");
      input.classList.add("invalid");
      return (passwordValid = false);
    } else {
      input.classList.remove("invalid");
      input.classList.add("valid");
      return (passwordValid = true);
    }
  }

  function dobValidation() {
    let input = document.getElementById("dateOfBirth");
    let dob = input.value;

    if (!dob) {
      input.classList.remove("valid");
      input.classList.add("invalid");
      return (dobValid = false);
    } else {
      input.classList.remove("invalid");
      input.classList.add("valid");
      return (dobValid = true);
    }
  }

  function nameFormValid() {
    nameValidation();
  }

  function emailFormValid() {
    emailValidation();
  }

  function passwordFormValid() {
    passwordValidation();
  }

  function dobFormValid() {
    dobValidation();
  }

  // checks for keyup
  document.getElementById('name').addEventListener('keyup', nameFormValid);
  document.getElementById('email').addEventListener('keyup', emailFormValid);
  document.getElementById('password').addEventListener('keyup', passwordFormValid);
  document.getElementById('dateOfBirth').addEventListener('keyup', dobFormValid);

  // checks for input - incase they paste it or something
  document.getElementById('name').addEventListener('input', nameFormValid);
  document.getElementById('email').addEventListener('input', emailFormValid);
  document.getElementById('password').addEventListener('input', passwordFormValid);
  document.getElementById('dateOfBirth').addEventListener('input', dobFormValid);

});