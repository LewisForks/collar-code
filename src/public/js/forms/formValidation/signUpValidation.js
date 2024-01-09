document.addEventListener('DOMContentLoaded', function () {

  var nameValid = false;
  var emailValid = false;
  var passwordValid = false;
  var dobValid = false;
  var formValid = false;

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

  function emailValidation() {
    let input = document.getElementById("email");
    let emailError = document.getElementById('emailError');
    let email = input.value.trim();
    var pattern = /^[^ ]+@[^ ]+\.[a-z]{2,7}$/;

    if (!email) {
      input.classList.remove("valid");
      input.classList.add("invalid");
      emailError.textContent = "Email is required.";
      return (emailValid = false);
    } else if (!pattern.test(email)) {
      input.classList.remove("valid");
      input.classList.add("invalid");
      emailError.textContent = "Invalid email format.";
      return (emailValid = false);
    } else {
      input.classList.remove("invalid");
      input.classList.add("valid");
      emailError.textContent = "";
      return (emailValid = true);
    }
  }

  function passwordValidation() {
    let input = document.getElementById("password");
    let passwordError = document.getElementById('passwordError');
    let password = input.value;

    if (!password || password.length < 8) {
      input.classList.remove("valid");
      input.classList.add("invalid");
      passwordError.textContent = "Password must be at least 8 characters.";
      return (passwordValid = false);
    } else if (password.length > 32) {
      input.classList.remove("valid");
      input.classList.add("invalid");
      passwordError.textContent = "Password cannot be more than 32 characters.";
      return (passwordValid = false);
    } else {
      input.classList.remove("invalid");
      input.classList.add("valid");
      passwordError.textContent = "";
      return (passwordValid = true);
    }
  }

  function dobValidation() {
    let input = document.getElementById("dateOfBirth");
    let dobError = document.getElementById('dateOfBirthError');
    let dob = input.value;

    if (!dob) {
      input.classList.remove("valid");
      input.classList.add("invalid");
      dobError.textContent = "Date of Birth is required.";
      return (dobValid = false);
    } else {
      input.classList.remove("invalid");
      input.classList.add("valid");
      dobError.textContent = "";
      return (dobValid = true);
    }
  }

  function formValidation() {
    const submitBtn = document.getElementById("submitBtn");

    if (nameValid && emailValid && passwordValid && dobValid) {
      submitBtn.style.background = "#6f55f2";
      submitBtn.style.cursor = "pointer";
      submitBtn.disabled = false;
      return (formValid = true);
    } else {
      submitBtn.style.background = "#6f55f23b";
      submitBtn.style.cursor = "not-allowed";
      submitBtn.disabled = true;
      return (formValid = false);
    }
  }


  formValidation();

  function nameFormValid() {
    nameValidation();
    formValidation();
  }

  function emailFormValid() {
    emailValidation();
    formValidation();
  }

  function passwordFormValid() {
    passwordValidation();
    formValidation();
  }

  function dobFormValid() {
    dobValidation();
    formValidation();
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