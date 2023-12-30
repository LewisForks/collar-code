document.addEventListener("DOMContentLoaded", function () {
    const typewriter = document.querySelector(".typewriter");
    const text1 = "Something else here";
    const text2 = "Effortless Registration";
    const text3 = "Top Tier Pet Security";
    const speed = 100;

    function typeAndDelete(text, callback) {
        let index = 0;
        const maxLength = text.length;

        function type() {
            if (index < maxLength) {
                typewriter.textContent += text.charAt(index);
                index++;
                setTimeout(type, speed);
            } else {
                setTimeout(() => deleteText(callback), 5000);
            }
        }

        function deleteText(callback) {
            if (index > 0) {
                typewriter.textContent = text.substring(0, index - 1);
                index--;
                setTimeout(() => deleteText(callback), speed);
            } else {
                callback();
            }
        }

        type();
    }

    function alternateText() {
        typeAndDelete(text2, () => {
            setTimeout(() => typeAndDelete(text3, () => {
                setTimeout(() => typeAndDelete(text1, alternateText), 1000);
            }), 1000);
        });
    }

    alternateText();
});

// scroll sections

let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 100;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if (top >= offset && top < offset + height) {
            navLinks.forEach(link => {
                link.classList.remove('selected');
                document.querySelector('header nav a[href*=' + id + ']').classList.add('selected');
            });
        }
    });
};

// contact form functionality (opens mail app)

document.getElementById('contactsubmit').addEventListener('click', function () {
    document.getElementById('contact-form').submit();
});

const contactForm = document.getElementById("contact-form");
const contactSubmit = document.getElementById("contactsubmit");
const contactTextarea = document.getElementById("contacttextarea");

contactSubmit.addEventListener("click", function () {
    const fullName = contactForm.full_name.value;
    const email = contactForm.email.value;
    const message = contactTextarea.value;
    const subject = encodeURIComponent("Contact Form Submission");

    const mailtoLink = `mailto:lewis@raybould.co?subject=${subject}&body=${encodeURIComponent(message)}`;
    window.location.href = mailtoLink;
});