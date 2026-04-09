document.addEventListener("DOMContentLoaded", () => {

const termsModal = document.getElementById("termsModal");
const closeTerms = document.getElementById("closeTermsModal");
const acceptTerms = document.getElementById("acceptTermsBtn");

const termsLinks = document.querySelectorAll(".terms-link");

termsLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        termsModal.style.display = "flex";
    });
});

closeTerms.addEventListener("click", () => {
    termsModal.style.display = "none";
});

acceptTerms.addEventListener("click", () => {
    termsModal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if(e.target === termsModal){
        termsModal.style.display = "none";
    }
});

});