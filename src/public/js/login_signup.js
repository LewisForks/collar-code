window.onload = function () {
    const pathName = window.location.pathname;
    if (pathName === '/signup') {
        document.getElementById('signUpForm').addEventListener('submit', function (event) {
            event.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const dateOfBirth = document.getElementById('dateOfBirth').value;

            fetch('/signup', {
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
                        window.location.href = '/verify';
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
    } else if (pathName === "/signin") {
        document.getElementById('signInForm').addEventListener('submit', function (event) {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            fetch('/signin', {
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
    }

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
};
