window.onload = function () {

    document.getElementById('resetPasswordForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const newpassword = document.getElementById('password').value;
        const _id = document.getElementById('_id-data').dataset._id
        const token = document.getElementById('token-data').dataset.token

        fetch(`/account/reset-password/${_id}/${token}`, {
            method: 'POST',
            body: JSON.stringify({
                password: newpassword,
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then((response) => response.json())
            .then((data) => {

                if (data.status === 'SUCCESS') {
                    var submittedContainer = document.querySelector('.submitted-container');
                    var resetPasswordForm = document.querySelector('.form-container');

                    if (submittedContainer && resetPasswordForm) {
                        submittedContainer.style.display = 'block';
                        resetPasswordForm.style.display = 'none';
                    }
                } else if (data.status === 'FAILED') {
                    clearErrorMessages();

                    displayError('password', data.errors.password);
                } else {
                    displayError('other', 'An unexpected error has occured. I have 0 idea how you got here...')
                }
            })
            .catch((error) => {
                console.error('Error during password reset:', error);
            });
    });

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
}