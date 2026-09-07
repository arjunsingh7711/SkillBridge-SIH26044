document.addEventListener("DOMContentLoaded", function () {


console.log("SCRIPT.JS LOADED");

const API_URL = "http://localhost:5000/api/auth";

let signupData = {};

const signupForm =
    document.getElementById("signupForm");


// ================================
// SIGNUP FORM
// ================================

if (!signupForm) {

    console.error("signupForm not found");

    return;
}


signupForm.addEventListener(
    "submit",
    async function (e) {

        e.preventDefault();

        console.log("CREATE ACCOUNT CLICKED");


        const name =
            document
                .getElementById("name")
                .value
                .trim();


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const password =
            document
                .getElementById("password")
                .value;


        const role =
            document
                .getElementById("role")
                .value;


        const message =
            document.getElementById("message");


        // ================================
        // BASIC VALIDATION
        // ================================

        if (!name || !email || !password) {

            message.innerText =
                "Please fill all required fields.";

            return;
        }


        if (password.length < 6) {

            message.innerText =
                "Password must be at least 6 characters.";

            return;
        }


        // Save signup data temporarily

        signupData = {

            name: name,

            email: email,

            password: password,

            role: role

        };


        message.innerText =
            "Sending OTP...";


        try {

            const response =
                await fetch(
                    API_URL + "/send-otp",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            email: email

                        })

                    }
                );


            console.log(
                "OTP STATUS:",
                response.status
            );


            const data =
                await response.json();


            console.log(
                "OTP SERVER:",
                data
            );


            if (!response.ok) {

                message.innerText =
                    data.message;

                return;
            }


            message.innerText =
                "OTP sent successfully!";


            // Open OTP modal

            const otpModal =
                document.getElementById(
                    "otpModal"
                );


            if (otpModal) {

                otpModal.style.display =
                    "flex";

            } else {

                console.error(
                    "otpModal not found"
                );

            }

        } catch (error) {

            console.error(
                "OTP ERROR:",
                error
            );


            message.innerText =
                "Unable to connect to server.";

        }

    }
);


// ================================
// VERIFY OTP
// ================================

window.verifyOTP =
    async function () {


        const otp =
            document
                .getElementById("otp")
                .value
                .trim();


        if (otp.length !== 6) {

            alert(
                "Please enter a 6-digit OTP."
            );

            return;
        }


        if (!signupData.email) {

            alert(
                "Signup session expired. Please enter your details again."
            );

            return;
        }


        try {

            console.log(
                "VERIFY OTP CLICKED"
            );


            const response =
                await fetch(
                    API_URL + "/verify-otp",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            name:
                                signupData.name,

                            email:
                                signupData.email,

                            password:
                                signupData.password,

                            role:
                                signupData.role,

                            otp:
                                otp

                        })

                    }
                );


            console.log(
                "VERIFY STATUS:",
                response.status
            );


            const data =
                await response.json();


            console.log(
                "VERIFY SERVER:",
                data
            );


            if (!response.ok) {

                alert(
                    data.message
                );

                return;
            }


            // Save newly created user

            if (data.user) {

                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        data.user
                    )
                );

            }


            alert(
                "Account created successfully!"
            );


            // Go to login

            window.location.href =
                "login.html";


        } catch (error) {

            console.error(
                "VERIFY ERROR:",
                error
            );


            alert(
                "Unable to connect to server."
            );

        }

    };


// ================================
// CLOSE OTP MODAL
// ================================

window.closeModal =
    function () {

        const modal =
            document.getElementById(
                "otpModal"
            );


        if (modal) {

            modal.style.display =
                "none";

        }

    };


});
