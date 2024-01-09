window.onload = function () {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const email = document.getElementById('email').value;

            fetch('/account/forgot-password', {
                method: 'POST',
                body: JSON.stringify({
                    email: email,
                }),
                headers: {
                    'Content-Type': 'application/json',
                }
            })
                .then((response) => response.json())
                .then((data) => {
                    var submittedContainer = document.querySelector('.submitted-container');
                    var forgotPasswordForm = document.querySelector('.form-container');

                    if (data.status === 'PENDING') {
                        if (submittedContainer && forgotPasswordForm) {
                            submittedContainer.style.display = 'block';
                            forgotPasswordForm.style.display = 'none';
                        }
                    } else if (data.status === 'SUCCESS') {
                        console.log('YAYYYYYY')
                    } else if (data.status === 'FAILED') {
                        // if (submittedContainer && forgotPasswordForm) {
                        //     submittedContainer.style.display = 'block';
                        //     forgotPasswordForm.style.display = 'none';
                        // }
                        displayError('other', data.error)
                    } else {
                        displayError('other', 'An unexpected error has occurred.')
                    }
                })
                .catch((error) => {
                    console.error('Error during password reset:', error);
                });
        });
    }
};

function clearErrorMessages() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach((element) => {
        element.textContent = '';
    });
}

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