window.onload = function () {
    document.getElementById('forgotPasswordForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;

        fetch('/forgot-password', {
            method: 'POST',
            body: JSON.stringify({
                name: name,
                email: email,
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then((response) => response.json())
            .then((data) => {
                // Check the status in the response
                if (data.status === 'PENDING') {
                    window.location.href = '/verify';
                } else if (data.status === 'FAILED') {
                    // Clear existing error messages
                    clearErrorMessages();

                    // Display validation messages
                    if (data.errors) {
                        displayError('name', data.errors.name);
                        displayError('email', data.errors.email);

                        return;
                    }
                } else {
                    // Handle other cases if needed
                }
            })
            .catch((error) => {
                console.error('Error during signup:', error);
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
};