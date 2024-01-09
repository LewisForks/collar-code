window.onload = function () {

    document.getElementById('registerPetForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const petName = document.getElementById('petName').value;
        const petBreed = document.getElementById('petBreed').value;
        const petAge = document.getElementById('petAge').value;

        fetch('/account/create-pet-profile', {
            method: 'POST',
            body: JSON.stringify({
                petName: petName,
                petBreed: petBreed,
                petAge: petAge,
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === 'SUCCESS') {
                    const petId = data.petId;
                    window.location.href = `/pet/${petId}`;
                } else if (data.status === 'FAILED') {
                    clearErrorMessages();
                    // display any errors
                    if (data.error) {
                        displayError('petName', data.error.petName);
                        displayError('petBreed', data.error.petBreed);
                        displayError('petAge', data.error.petAge);
                        displayError('other', data.error.other);
                        return;
                    }
                } else if (data.status === 'SESSIONEXPIRED') {
                    window.location.href='/account/signin?sessionexpired'
                } else {
                    displayError('other', "An unexpected error has occured. I actually don't know how you got here tbh")
                }
            })
            .catch((error) => {
                console.error('Error during pet profile creation:', error);
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