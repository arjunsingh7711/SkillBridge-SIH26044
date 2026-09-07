const API_URL = "http://localhost:5000/api/auth";

let userEmail = "";

// ========================================
// SEND OTP
// ========================================

document
.getElementById("sendOtpBtn")
.addEventListener("click", async function () {


    const email =
        document.getElementById("email").value.trim();

    const message =
        document.getElementById("message");

    if (!email) {

        message.innerText =
            "Please enter your email.";

        return;
    }

    userEmail = email;

    message.innerText =
        "Sending OTP...";

    try {

        const response = await fetch(
            API_URL + "/forgot-password",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email
                })
            }
        );

        const data = await response.json();

        console.log("FORGOT PASSWORD:", data);

        if (!response.ok) {

            message.innerText =
                data.message;

            return;
        }

        message.innerText =
            "OTP sent! Check your email.";

        document.getElementById(
            "emailSection"
        ).style.display = "none";

        document.getElementById(
            "resetSection"
        ).style.display = "block";

    } catch (error) {

        console.error(error);

        message.innerText =
            "Unable to connect to server.";
    }

});


// ========================================
// RESET PASSWORD
// ========================================

document
.getElementById("resetBtn")
.addEventListener("click", async function () {


    const otp =
        document.getElementById("otp").value.trim();

    const newPassword =
        document.getElementById("newPassword").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    const message =
        document.getElementById("message");


    if (otp.length !== 6) {

        message.innerText =
            "Enter a valid 6-digit OTP.";

        return;
    }


    if (!newPassword || !confirmPassword) {

        message.innerText =
            "Please enter both passwords.";

        return;
    }


    if (newPassword !== confirmPassword) {

        message.innerText =
            "Passwords do not match.";

        return;
    }


    message.innerText =
        "Resetting password...";


    try {

        const response = await fetch(
            API_URL + "/reset-password",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    email: userEmail,

                    otp: otp,

                    newPassword: newPassword

                })
            }
        );


        const data =
            await response.json();


        console.log(
            "RESET PASSWORD:",
            data
        );


        if (!response.ok) {

            message.innerText =
                data.message;

            return;
        }


        alert(
            "Password reset successfully! Please login."
        );


        window.location.href =
            "login.html";


    } catch (error) {

        console.error(error);

        message.innerText =
            "Unable to connect to server.";
    }

});
