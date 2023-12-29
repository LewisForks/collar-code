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
            }).then((response) => response.json()).then((data) => {
                if (data.status === 'PENDING') {
                    window.location.href = '/verified?pending=true'
                }
            })
            .catch((error) => {
                console.error('Error during signup:', error)
            });
        });
    } else if (pathName === "/login") {
        document.getElementById('loginForm').addEventListener('submit', function(event) {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            fetch('/login', {
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
                    } else {
                        alert("Incorrect Login Data.")
                    }
                })
                .catch((error) => {
                    console.error('Error during login:', error);
                });
        });
    }};