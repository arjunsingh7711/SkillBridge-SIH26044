const API_URL =
    "http://localhost:5000/api/skills";


// ================================
// CHECK LOGIN
// ================================

const userData =
    localStorage.getItem("user");

const token =
    localStorage.getItem("token");


if (!userData || !token) {

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    window.location.href =
        "login.html";

} else {

    const user =
        JSON.parse(userData);

    setupUser(user);

    loadDashboardSkills();

}


// ================================
// SET USER INFORMATION
// ================================

function setupUser(user) {

    const name =
        user.name || "User";


    document.getElementById(
        "welcomeMessage"
    ).innerText =
        "Welcome back, " + name + "!";


    document.getElementById(
        "profileName"
    ).innerText =
        name;


    document.getElementById(
        "profileRole"
    ).innerText =
        user.role || "Student";


    const firstLetter =
        name
            .charAt(0)
            .toUpperCase();


    document.getElementById(
        "avatar"
    ).innerText =
        firstLetter;

}


// ================================
// LOAD SKILLS
// ================================

async function loadDashboardSkills() {

    try {

        const response =
            await fetch(API_URL, {

                method: "GET",

                headers: {

                    "Authorization":
                        "Bearer " +
                        localStorage.getItem("token")

                }

            });


        const skills =
            await response.json();


        console.log(
            "Dashboard Skills:",
            skills
        );


        // ================================
        // TOKEN INVALID / EXPIRED
        // ================================

        if (response.status === 401) {

            logout();

            return;

        }


        if (!response.ok) {

            console.error(
                "Failed to load skills:",
                skills
            );

            return;

        }


        updateSkillCount(
            skills
        );


        updateSkillProgress(
            skills
        );


    } catch (error) {

        console.error(
            "DASHBOARD SKILLS ERROR:",
            error
        );

    }

}


// ================================
// SKILL COUNT
// ================================

function updateSkillCount(skills) {

    const count =
        document.getElementById(
            "skillCount"
        );


    count.innerText =
        String(
            skills.length
        ).padStart(
            2,
            "0"
        );

}


// ================================
// SKILL PROGRESS
// ================================

function updateSkillProgress(skills) {

    const container =
        document.getElementById(
            "dashboardSkills"
        );


    container.innerHTML = "";


    if (
        !skills ||
        skills.length === 0
    ) {

        container.innerHTML = `

            <p class="empty">

                No skills added yet.

                <br>

                Add your skills to start tracking your progress.

            </p>

        `;

        return;

    }


    // Show maximum 6 skills

    skills
        .slice(0, 6)
        .forEach(function (skill) {

            const percentage =
                Number(
                    skill.percentage
                ) || 0;


            const skillElement =
                document.createElement(
                    "div"
                );


            skillElement.className =
                "skill";


            skillElement.innerHTML = `

                <div class="skill-info">

                    <span>
                        ${skill.name}
                    </span>

                    <span>
                        ${percentage}%
                    </span>

                </div>


                <div class="progress">

                    <div
                        class="progress-bar"
                        style="width:${percentage}%">
                    </div>

                </div>

            `;


            container.appendChild(
                skillElement
            );

        });

}


// ================================
// LOGOUT
// ================================

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

