const API_URL = "http://localhost:5000/api/profile";

// ==========================================
// CHECK LOGIN
// ==========================================

const userData = localStorage.getItem("user");
const token = localStorage.getItem("token");

if (!userData || !token) {
    window.location.href = "login.html";
}

let loggedUser;

try {
    loggedUser = JSON.parse(userData);
} catch (error) {
    console.error("USER DATA ERROR:", error);

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    window.location.href = "login.html";
}


// ==========================================
// GET USER ID FROM JWT
// ==========================================

function getUserIdFromToken() {

    try {

        const payload =
            JSON.parse(
                atob(
                    token.split(".")[1]
                        .replace(/-/g, "+")
                        .replace(/_/g, "/")
                )
            );

        console.log("JWT PAYLOAD:", payload);

        return String(payload.id);

    }

    catch (error) {

        console.error(
            "JWT DECODE ERROR:",
            error
        );

        return null;

    }

}


const userId = getUserIdFromToken();

console.log("FINAL USER ID:", userId);


// ==========================================
// CHECK USER ID
// ==========================================

if (!userId) {

    console.error(
        "USER ID NOT FOUND IN TOKEN"
    );

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href =
        "login.html";
}


// ==========================================
// LOAD PROFILE
// ==========================================

async function loadProfile() {

    try {

        console.log(
            "LOADING PROFILE FOR:",
            userId
        );

        const response =
            await fetch(
                API_URL + "/" + userId,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "PROFILE RESPONSE:",
            data
        );


        if (response.status === 401) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href =
                "login.html";

            return;

        }


        if (!response.ok) {

            console.error(
                "PROFILE LOAD FAILED:",
                data
            );

            return;

        }


        // ======================================
        // BASIC DETAILS
        // ======================================

        const name =
            document.getElementById("name");

        const email =
            document.getElementById("email");


        if (name) {
            name.value =
                data.name || "";
        }


        if (email) {

            email.value =
                data.email || "";

            email.removeAttribute("readonly");
            email.removeAttribute("disabled");

        }


        // ======================================
        // EDUCATION
        // ======================================

        const college =
            document.getElementById("college");

        const branch =
            document.getElementById("branch");

        const year =
            document.getElementById("year");


        if (college) {
            college.value =
                data.college || "";
        }


        if (branch) {
            branch.value =
                data.branch || "";
        }


        if (year) {
            year.value =
                data.year || "";
        }


        // ======================================
        // CAREER
        // ======================================

        const preferredRole =
            document.getElementById(
                "preferredRole"
            );

        const preferredLocation =
            document.getElementById(
                "preferredLocation"
            );

        const workMode =
            document.getElementById(
                "workMode"
            );

        const experience =
            document.getElementById(
                "experience"
            );


        if (preferredRole) {

            preferredRole.value =
                data.preferredRole || "";

        }


        if (preferredLocation) {

            preferredLocation.value =
                data.preferredLocation || "";

        }


        if (workMode) {

            workMode.value =
                data.workMode || "";

        }


        if (experience) {

            experience.value =
                data.experience ||
                "Fresher";

        }


        // ======================================
        // ABOUT
        // ======================================

        const bio =
            document.getElementById("bio");


        if (bio) {

            bio.value =
                data.bio || "";

        }


        // ======================================
        // SOCIAL LINKS
        // ======================================

        const github =
            document.getElementById("github");

        const linkedin =
            document.getElementById("linkedin");

        const portfolio =
            document.getElementById("portfolio");


        if (github) {

            github.value =
                data.github || "";

        }


        if (linkedin) {

            linkedin.value =
                data.linkedin || "";

        }


        if (portfolio) {

            portfolio.value =
                data.portfolio || "";

        }


        // ======================================
        // HEADER
        // ======================================

        updateHeader(data);


        // ======================================
        // COMPLETION
        // ======================================

        calculateCompletion(data);

    }

    catch (error) {

        console.error(
            "LOAD PROFILE ERROR:",
            error
        );

    }

}


// ==========================================
// UPDATE HEADER
// ==========================================

function updateHeader(user) {

    const firstLetter =
        user.name
            ? user.name.charAt(0).toUpperCase()
            : "U";


    const profileName =
        document.getElementById(
            "profileName"
        );

    if (profileName) {

        profileName.innerText =
            user.name || "User";

    }


    const profileEmail =
        document.getElementById(
            "profileEmail"
        );

    if (profileEmail) {

        profileEmail.innerText =
            user.email ||
            "user@email.com";

    }


    const miniName =
        document.getElementById(
            "miniName"
        );

    if (miniName) {

        miniName.innerText =
            user.name || "User";

    }


    const miniRole =
        document.getElementById(
            "miniRole"
        );

    if (miniRole) {

        miniRole.innerText =
            user.role || "Student";

    }


    const smallAvatar =
        document.getElementById(
            "smallAvatar"
        );

    if (smallAvatar) {

        smallAvatar.innerText =
            firstLetter;

    }


    const largeAvatar =
        document.getElementById(
            "largeAvatar"
        );

    if (largeAvatar) {

        largeAvatar.innerText =
            firstLetter;

    }

}


// ==========================================
// PROFILE COMPLETION
// ==========================================

function calculateCompletion(user) {

    const fields = [

        user.name,
        user.email,
        user.college,
        user.branch,
        user.year,
        user.preferredRole,
        user.preferredLocation,
        user.workMode,
        user.bio,
        user.github,
        user.linkedin,
        user.portfolio

    ];


    const completed =
        fields.filter(
            field =>
                field &&
                field.toString().trim() !== ""
        ).length;


    const percentage =
        Math.round(
            (completed / fields.length) * 100
        );


    const completionText =
        document.getElementById(
            "completionText"
        );

    const completionFill =
        document.getElementById(
            "completionFill"
        );


    if (completionText) {

        completionText.innerText =
            percentage + "%";

    }


    if (completionFill) {

        completionFill.style.width =
            percentage + "%";

    }

}


// ==========================================
// SAVE PROFILE
// ==========================================

async function saveProfile() {

    const message =
        document.getElementById(
            "message"
        );


    // ======================================
    // GET FORM VALUES
    // ======================================

    const profileData = {

        name:
            document.getElementById(
                "name"
            ).value.trim(),

        email:
            document.getElementById(
                "email"
            ).value.trim(),

        college:
            document.getElementById(
                "college"
            ).value.trim(),

        branch:
            document.getElementById(
                "branch"
            ).value.trim(),

        year:
            document.getElementById(
                "year"
            ).value,

        preferredRole:
            document.getElementById(
                "preferredRole"
            ).value.trim(),

        preferredLocation:
            document.getElementById(
                "preferredLocation"
            ).value.trim(),

        workMode:
            document.getElementById(
                "workMode"
            ).value,

        experience:
            document.getElementById(
                "experience"
            ).value,

        bio:
            document.getElementById(
                "bio"
            ).value.trim(),

        github:
            document.getElementById(
                "github"
            ).value.trim(),

        linkedin:
            document.getElementById(
                "linkedin"
            ).value.trim(),

        portfolio:
            document.getElementById(
                "portfolio"
            ).value.trim()

    };


    console.log(
        "PROFILE DATA BEING SENT:",
        profileData
    );

    console.log(
        "SAVING FOR USER ID:",
        userId
    );


    // ======================================
    // VALIDATION
    // ======================================

    if (!profileData.name) {

        message.innerText =
            "Please enter your name.";

        return;

    }


    if (!profileData.email) {

        message.innerText =
            "Please enter your email.";

        return;

    }


    message.innerText =
        "Saving...";


    // ======================================
    // SEND REQUEST
    // ======================================

    try {

        const response =
            await fetch(
                API_URL + "/" + userId,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token

                    },

                    body:
                        JSON.stringify(
                            profileData
                        )

                }
            );


        const data =
            await response.json();


        console.log(
            "SAVE PROFILE RESPONSE:",
            data
        );


        // ==================================
        // AUTH ERROR
        // ==================================

        if (response.status === 401) {

            console.error(
                "TOKEN INVALID OR EXPIRED"
            );

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            window.location.href =
                "login.html";

            return;

        }


        // ==================================
        // ACCESS DENIED
        // ==================================

        if (response.status === 403) {

            console.error(
                "ACCESS DENIED"
            );

            console.error(
                "FRONTEND USER ID:",
                userId
            );

            message.innerText =
                "Access denied. Please login again.";

            return;

        }


        // ==================================
        // OTHER ERROR
        // ==================================

        if (!response.ok) {

            console.error(
                "SAVE FAILED:",
                data
            );

            message.innerText =
                data.message ||
                "Failed to save profile.";

            return;

        }


        // ==================================
        // UPDATE LOCAL STORAGE
        // ==================================

        if (data.user) {

            localStorage.setItem(
                "user",
                JSON.stringify(
                    data.user
                )
            );

        }


        // ==================================
        // SUCCESS
        // ==================================

        message.innerText =
            "✓ Profile saved successfully";


        if (data.user) {

            updateHeader(
                data.user
            );

            calculateCompletion(
                data.user
            );

        }
        else {

            await loadProfile();

        }


        // ==================================
        // CLEAR MESSAGE
        // ==================================

        setTimeout(
            function () {

                message.innerText = "";

            },
            3000
        );

    }

    catch (error) {

        console.error(
            "SAVE PROFILE ERROR:",
            error
        );

        message.innerText =
            "Unable to connect to server.";

    }

}


// ==========================================
// LOGOUT
// ==========================================

function logout() {

    localStorage.removeItem(
        "user"
    );

    localStorage.removeItem(
        "token"
    );

    window.location.href =
        "login.html";

}


// ==========================================
// INITIAL LOAD
// ==========================================

loadProfile();