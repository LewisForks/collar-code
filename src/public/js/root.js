document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('menu-icon').addEventListener('click', function () {
        var mobileNavbar = document.querySelector('.mobile-navbar');
        mobileNavbar.classList.toggle('show');
    });
});