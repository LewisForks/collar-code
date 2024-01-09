document.addEventListener('DOMContentLoaded', function () {

    var passwordValid = false;
    var formValid = false;

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

    function formValidation() {
        const submitBtn = document.getElementById("submitBtn");

        if (passwordValid) {
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

    function passwordFormValid() {
        passwordValidation();
        formValidation();
    }

    // checks for keyup
    document.getElementById('password').addEventListener('keyup', passwordFormValid);

    // checks for input - incase they paste it or something
    document.getElementById('password').addEventListener('input', passwordFormValid);

});