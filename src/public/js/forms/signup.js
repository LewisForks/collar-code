document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('signUpForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const dateOfBirth = document.getElementById('dateOfBirth').value;

        fetch('/api/user-portal/signup', {
            method: 'POST',
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
                dateOfBirth: dateOfBirth
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === 'PENDING') {
                    window.location.href = '/account/verify';
                } else if (data.status === 'FAILED') {
                    clearErrorMessages();

                    // display any errors
                    if (data.errors) {
                        displayError('name', data.errors.name);
                        displayError('email', data.errors.email);
                        displayError('password', data.errors.password);
                        displayError('dateOfBirth', data.errors.dateOfBirth);

                        return;
                    }
                } else {
                    displayError('other', "An unexpected error has occured. I actually don't know how you got here tbh")
                }
            })
            .catch((error) => {
                console.error('Error during signup:', error);
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
});