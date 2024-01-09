window.onload = function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sessionExpired = urlParams.has("sessionexpired");
    const verificationSuccess = urlParams.has("verificationsuccess");

    if (sessionExpired) {
        displayError('other', 'No session found, please sign in.');
    } else if (verificationSuccess) {
        verified = document.getElementById('verification-success');
        verified.style.display = 'block';
    }

    document.getElementById('signInForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;


        fetch('/api/user-portal/signin', {
            method: 'POST',
            body: JSON.stringify({
                email: email,
                password: password
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === 'SUCCESS') {
                    window.location.href = '/dashboard';
                } else if (data.status === 'FAILED') {
                    clearErrorMessages();

                    displayError('email', data.errors.email);
                    displayError('password', data.errors.password);
                    displayError('noaccount', data.errors.noaccount);
                    displayError('other', data.errors.other);
                } else {
                    displayError('other', 'An unexpected error has occured.')
                }
            })
            .catch((error) => {
                console.error('Error during login:', error);
            });
    });

    // clear error messages
    function clearErrorMessages() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach((element) => {
            element.textContent = '';
        });
    }

    // display error messages
    function displayError(field, message) {
        const errorElement = document.getElementById(`${field}Error`);

        if (errorElement) {
            if (message && /<[a-z][\s\S]*>/i.test(message)) {
                errorElement.innerHTML = message;
            } else {

                errorElement.textContent = message || '';
            }
        }
    }
}