document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('menu-icon').addEventListener('click', toggleMobileNavbar);

    function toggleMobileNavbar(event) {
        event.preventDefault();
    
        var mobileNavbar = document.querySelector('.mobile-navbar');
        mobileNavbar.classList.toggle('show');
    }
});
