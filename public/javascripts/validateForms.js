(() => {
    "use strict";
    // Fetch all the forms we want to apply custom Bootstrtap validattion sttyles to
    const forms = document.querySelectorAll(".validated-form");
    // Loop ove them and prevent submission
    Array.from(forms).forEach((form) => {
        form.addEventListener(
            "submit",
            (event) => {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                form.classList.add("was-validated");
            },
            false
        );
    });
})();