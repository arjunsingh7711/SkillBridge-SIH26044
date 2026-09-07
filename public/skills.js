const API_URL = "http://localhost:5000/api/skills";

console.log("SKILL.JS LOADED");
// ================================
// CHECK LOGIN
// ================================

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}


// ================================
// ADD SKILL
// ================================

async function addSkill() {

    const nameInput =
        document.getElementById("skillName");

    const levelInput =
        document.getElementById("skillLevel");

    const percentageInput =
        document.getElementById("skillPercentage");

    const message =
        document.getElementById("skillMessage");


    const name =
        nameInput.value.trim();

    const level =
        levelInput.value;

    const percentage =
        Number(percentageInput.value) || 25;


    if (!name) {

        message.textContent =
            "Please enter skill name.";

        return;
    }


    try {

        const response =
            await fetch(API_URL, {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " +
                        localStorage.getItem("token")

                },

                body: JSON.stringify({

                    name: name,

                    level: level,

                    percentage: percentage

                })

            });


        const data =
            await response.json();


        console.log(
            "ADD SKILL RESPONSE:",
            data
        );


        if (response.status === 401) {

            logout();

            return;

        }


        if (!response.ok) {

            message.textContent =
                data.message ||
                "Failed to add skill.";

            return;

        }


        message.textContent =
            "Skill added successfully!";


        // Clear fields

        nameInput.value = "";

        percentageInput.value = "";


        // Reload dashboard skills

        if (typeof loadDashboardSkills === "function") {

            loadDashboardSkills();

        }


    } catch (error) {

        console.error(
            "ADD SKILL ERROR:",
            error
        );

        message.textContent =
            "Unable to connect to server.";

    }

}


// ================================
// DELETE SKILL
// ================================

async function deleteSkill(skillId) {

    try {

        const response =
            await fetch(
                API_URL + "/" + skillId,
                {

                    method: "DELETE",

                    headers: {

                        "Authorization":
                            "Bearer " +
                            localStorage.getItem("token")

                    }

                }
            );


        const data =
            await response.json();


        console.log(
            "DELETE SKILL RESPONSE:",
            data
        );


        if (response.status === 401) {

            logout();

            return;

        }


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete skill."
            );

            return;

        }


        // Reload skills

        if (typeof loadDashboardSkills === "function") {

            loadDashboardSkills();

        }


    } catch (error) {

        console.error(
            "DELETE SKILL ERROR:",
            error
        );

    }

}


// ================================
// LOGOUT
// ================================

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href =
        "login.html";

}
