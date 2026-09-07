const loginButton =
    document.getElementById("loginButton");

const message =
    document.getElementById("message");


loginButton.addEventListener("click", async function () {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    // Validation
    if (!email || !password) {

        message.innerText =
            "Please enter email and password.";

        message.style.color = "red";

        return;
    }


    // Button state
    loginButton.disabled = true;

    loginButton.innerText =
        "Logging in...";


    message.innerText =
        "Please wait...";

    message.style.color =
        "#555";


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


        const data =
            await response.json();


        console.log(
            "LOGIN RESPONSE:",
            data
        );


        // Login failed
        if (!response.ok) {

            message.innerText =
                data.message ||
                "Invalid email or password.";

            message.style.color =
                "red";

            loginButton.disabled = false;

            loginButton.innerText =
                "Login";

            return;
        }


        // Token check
        if (!data.token) {

            message.innerText =
                "Login failed: token not received.";

            message.style.color =
                "red";

            loginButton.disabled = false;

            loginButton.innerText =
                "Login";

            return;
        }


        // User check
        if (!data.user) {

            message.innerText =
                "Login failed: user data not received.";

            message.style.color =
                "red";

            loginButton.disabled = false;

            loginButton.innerText =
                "Login";

            return;
        }


        /*
         * SAVE TOKEN
         */

        localStorage.setItem(
            "token",
            data.token
        );


        /*
         * SAVE USER
         */

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );


        console.log(
            "USER:",
            data.user
        );

        console.log(
            "USER ROLE:",
            data.user.role
        );


        message.innerText =
            "Login successful!";

        message.style.color =
            "green";


        /*
         * ROLE BASED REDIRECT
         */

        setTimeout(function () {

            if (data.user.role === "company") {

                window.location.href =
                    "company-dashboard.html";

            }

            else if (data.user.role === "college") {

                window.location.href =
                    "college-dashboard.html";

            }

            else if (data.user.role === "admin") {

                window.location.href =
                    "admin-dashboard.html";

            }

            else {

                // Student
                window.location.href =
                    "dashboard.html";

            }

        }, 500);


    }
    catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        message.innerText =
            "Unable to connect to server.";

        message.style.color =
            "red";


        loginButton.disabled = false;

        loginButton.innerText =
            "Login";

    }

});