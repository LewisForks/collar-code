document.addEventListener('DOMContentLoaded', function () {

    var emailValid = false;
    var formValid = false;

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

    function formValidation() {
        const submitBtn = document.getElementById("submitBtn");

        if (emailValid) {
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

    function emailFormValid() {
        emailValidation();
        formValidation();
    }

    // checks for keyup
    document.getElementById('email').addEventListener('keyup', emailFormValid);

    // checks for input - incase they paste it or something
    document.getElementById('email').addEventListener('input', emailFormValid);

});