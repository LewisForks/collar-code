window.onload = function () {

    const menuOpen = document.getElementById('menu-open');
    const menuClose = document.getElementById('menu-close');
    const sideBar = document.querySelector('.container .left-section');
    const sidebarItems = document.querySelectorAll('.container .left-section .sidebar .item');

    menuOpen.addEventListener('click', () => {
        sideBar.style.top = '0';
    });

    menuClose.addEventListener('click', () => {
        sideBar.style.top = '-60vh';
    });

    let activeItem = sidebarItems[0];

    sidebarItems.forEach(element => {
        element.addEventListener('click', () => {
            if (activeItem) {
                activeItem.removeAttribute('id');
            }

            element.setAttribute('id', 'active');
            activeItem = element;

        });
    })

    const editBtn = document.getElementById('editBtn');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    editBtn.addEventListener('click', () => {
        editDetails();
    });

    submitBtn.addEventListener('click', () => {
        submitDetails();
    });

    cancelBtn.addEventListener('click', () => {
        cancelEditDetails();
    });

    function editDetails() {
        const submitBtn = document.getElementById('submitBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const editBtn = document.getElementById('editBtn');
        const rightDetails = document.getElementsByClassName('right-details')[0];
        const rightDetailsForm = document.getElementsByClassName('right-details-form')[0];
        const confirmPasswordText = document.getElementById('confirmPasswordText');


        confirmPasswordText.style.display = "block";
        rightDetailsForm.style.display = "block";
        rightDetails.style.display = "none";
        submitBtn.style.display = "block";
        cancelBtn.style.display = "block";
        editBtn.style.display = "none";
    }

    function cancelEditDetails() {
        const submitBtn = document.getElementById('submitBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const editBtn = document.getElementById('editBtn');
        const rightDetails = document.getElementsByClassName('right-details')[0];
        const rightDetailsForm = document.getElementsByClassName('right-details-form')[0];
        const accountDetailsForm = document.getElementById('accountDetailsForm');
        const confirmPasswordText = document.getElementById('confirmPasswordText');
        clearErrorMessages();

        accountDetailsForm.reset();
        confirmPasswordText.style.display = "none";
        rightDetailsForm.style.display = "none";
        rightDetails.style.display = "flex";
        submitBtn.style.display = "none";
        cancelBtn.style.display = "none";
        editBtn.style.display = "block";
    }

    function submitDetails() {

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const dateOfBirth = document.getElementById('dateOfBirth').value;

        fetch('/api/user-portal/update-details', {
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
                if (data.status === 'SUCCESS') {
                    window.location.href = '/dashboard';
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