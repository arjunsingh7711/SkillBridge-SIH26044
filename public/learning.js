// ============================================================
// SKILLBRIDGE - LEARNING PAGE
// Demo Version
// ============================================================

const SKILLS_API = "http://localhost:5000/api/skills";
const OPPORTUNITIES_API = "http://localhost:5000/api/opportunities";


// ============================================================
// DEMO COURSES
// ============================================================

const courses = [
    {
        id: "python",
        title: "Python Programming",
        category: "Programming",
        icon: "🐍",
        level: "Beginner",
        duration: "6 hours",
        description: "Learn Python basics, functions, loops, lists and problem solving.",
        skills: ["python"]
    },

    {
        id: "dsa",
        title: "Data Structures & Algorithms",
        category: "Programming",
        icon: "🧠",
        level: "Intermediate",
        duration: "12 hours",
        description: "Master arrays, strings, searching, sorting, recursion and algorithms.",
        skills: ["dsa", "data structures", "algorithms"]
    },

    {
        id: "javascript",
        title: "Modern JavaScript",
        category: "Programming",
        icon: "🟨",
        level: "Intermediate",
        duration: "8 hours",
        description: "Improve JavaScript with modern syntax, DOM and asynchronous programming.",
        skills: ["javascript", "js"]
    },

    {
        id: "nodejs",
        title: "Node.js Backend Development",
        category: "Backend",
        icon: "🟢",
        level: "Intermediate",
        duration: "9 hours",
        description: "Build backend applications and APIs using Node.js and Express.",
        skills: ["node.js", "nodejs", "express", "backend"]
    },

    {
        id: "rest-api",
        title: "REST API Development",
        category: "Backend",
        icon: "🔗",
        level: "Intermediate",
        duration: "5 hours",
        description: "Learn how to design and build professional REST APIs.",
        skills: ["rest api", "api", "backend"]
    },

    {
        id: "mongodb",
        title: "MongoDB & Database Design",
        category: "Database",
        icon: "🍃",
        level: "Intermediate",
        duration: "8 hours",
        description: "Learn MongoDB, queries, collections and database design.",
        skills: ["mongodb", "mongo", "database"]
    },

    {
        id: "sql",
        title: "SQL & Databases",
        category: "Database",
        icon: "🗄️",
        level: "Beginner",
        duration: "7 hours",
        description: "Learn SQL queries, joins, grouping and relational databases.",
        skills: ["sql", "mysql", "database"]
    },

    {
        id: "git",
        title: "Git & GitHub Essentials",
        category: "Tools",
        icon: "🔧",
        level: "Beginner",
        duration: "4 hours",
        description: "Learn Git, GitHub, commits, branches and collaboration.",
        skills: ["git", "github"]
    },

    {
        id: "ml",
        title: "Machine Learning Fundamentals",
        category: "AI/ML",
        icon: "🤖",
        level: "Intermediate",
        duration: "10 hours",
        description: "Learn regression, classification and basic machine learning concepts.",
        skills: ["machine learning", "ml", "ai"]
    },

    {
        id: "data-science",
        title: "Data Science with Python",
        category: "Data Science",
        icon: "📊",
        level: "Intermediate",
        duration: "10 hours",
        description: "Learn NumPy, Pandas, data cleaning and exploratory data analysis.",
        skills: ["data science", "pandas", "numpy"]
    }
];


// ============================================================
// DEMO REQUIREMENTS
// Used only when opportunities don't contain skills
// ============================================================

const demoRequirements = [
    {
        name: "Python",
        required: 80,
        opportunities: 5
    },
    {
        name: "JavaScript",
        required: 75,
        opportunities: 4
    },
    {
        name: "Node.js",
        required: 80,
        opportunities: 4
    },
    {
        name: "MongoDB",
        required: 75,
        opportunities: 3
    },
    {
        name: "REST API",
        required: 70,
        opportunities: 3
    },
    {
        name: "SQL",
        required: 75,
        opportunities: 4
    },
    {
        name: "Git",
        required: 60,
        opportunities: 5
    },
    {
        name: "Data Structures",
        required: 80,
        opportunities: 3
    }
];


// ============================================================
// GLOBAL DATA
// ============================================================

let studentSkills = [];
let opportunities = [];
let skillRequirements = [];


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    checkLogin();

    loadUser();

    renderCourses(courses);

    setupCourseSearch();

    setupLogout();

    loadData();

});


// ============================================================
// CHECK LOGIN
// ============================================================

function checkLogin() {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
    }

}


// ============================================================
// LOAD USER
// ============================================================

function loadUser() {

    let user = {};

    try {
        user = JSON.parse(
            localStorage.getItem("user") || "{}"
        );
    } catch (error) {
        user = {};
    }

    const name =
        user.name ||
        user.fullName ||
        user.username ||
        "Student";

    const nameElement =
        document.getElementById("userName");

    const avatarElement =
        document.getElementById("userAvatar");

    if (nameElement) {
        nameElement.textContent = name;
    }

    if (avatarElement) {
        avatarElement.textContent =
            name.charAt(0).toUpperCase();
    }

}


// ============================================================
// LOAD DATA
// ============================================================

async function loadData() {

    await Promise.all([
        loadSkills(),
        loadOpportunities()
    ]);

    createSkillAnalysis();

    updateStats();

    calculateReadiness();

}


// ============================================================
// LOAD SKILLS
// ============================================================

async function loadSkills() {

    const token =
        localStorage.getItem("token");

    try {

        const response = await fetch(
            SKILLS_API,
            {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (response.status === 401) {

            logout();
            return;

        }

        if (!response.ok) {
            throw new Error(
                "Skills API failed"
            );
        }

        const data =
            await response.json();

        if (Array.isArray(data)) {

            studentSkills = data;

        } else if (Array.isArray(data.skills)) {

            studentSkills = data.skills;

        } else {

            studentSkills = [];

        }

        console.log(
            "Learning - Skills:",
            studentSkills
        );

    } catch (error) {

        console.error(
            "Learning Skills Error:",
            error
        );

        studentSkills = [];

    }

}


// ============================================================
// LOAD OPPORTUNITIES
// ============================================================

async function loadOpportunities() {

    try {

        const response =
            await fetch(OPPORTUNITIES_API);

        if (!response.ok) {

            throw new Error(
                "Opportunities API failed"
            );

        }

        const data =
            await response.json();

        if (Array.isArray(data)) {

            opportunities = data;

        } else if (
            Array.isArray(data.opportunities)
        ) {

            opportunities =
                data.opportunities;

        } else {

            opportunities = [];

        }

        console.log(
            "Learning - Opportunities:",
            opportunities
        );

    } catch (error) {

        console.error(
            "Learning Opportunities Error:",
            error
        );

        opportunities = [];

    }

}


// ============================================================
// CREATE SKILL ANALYSIS
// ============================================================

function createSkillAnalysis() {

    let requirements = [];

    /*
        Try to get skills directly from
        company opportunities first.
    */

    opportunities.forEach(function (opportunity) {

        const skills =
            getOpportunitySkills(
                opportunity
            );

        skills.forEach(function (skill) {

            const name =
                normalize(skill.name);

            if (!name) {
                return;
            }

            const required =
                getRequiredLevel(
                    skill.level
                );

            const existing =
                requirements.find(
                    item =>
                        normalize(item.name) === name
                );

            if (existing) {

                existing.required =
                    Math.max(
                        existing.required,
                        required
                    );

                existing.opportunities++;

            } else {

                requirements.push({

                    name: skill.name,

                    required: required,

                    opportunities: 1

                });

            }

        });

    });


    /*
        If backend opportunities don't contain
        required skills, use demo requirements.
    */

    if (requirements.length === 0) {

        requirements =
            demoRequirements.map(
                item => ({
                    ...item
                })
            );

    }


    skillRequirements =
        requirements.map(function (item) {

            const current =
                getStudentSkillLevel(
                    item.name
                );

            let status;

            if (current === 0) {

                status = "must";

            } else if (
                current < item.required
            ) {

                status = "improve";

            } else {

                status = "met";

            }

            return {

                name: item.name,

                required: item.required,

                opportunities:
                    item.opportunities,

                current: current,

                status: status

            };

        });


    /*
        Priority:

        MUST LEARN
        IMPROVE
        MET
    */

    skillRequirements.sort(
        function (a, b) {

            const priority = {
                must: 1,
                improve: 2,
                met: 3
            };

            return (
                priority[a.status] -
                priority[b.status]
            );

        }
    );


    renderSkillRequirements();

}


// ============================================================
// GET OPPORTUNITY SKILLS
// ============================================================

function getOpportunitySkills(opportunity) {

    let raw =
        opportunity.requiredSkills ||
        opportunity.skillsRequired ||
        opportunity.skills ||
        opportunity.requirements ||
        [];


    if (
        typeof raw === "string"
    ) {

        return raw
            .split(",")
            .map(function (skill) {

                return {
                    name: skill.trim(),
                    level: "Intermediate"
                };

            })
            .filter(
                item => item.name
            );

    }


    if (!Array.isArray(raw)) {

        return [];

    }


    return raw.map(function (skill) {

        if (
            typeof skill === "string"
        ) {

            return {
                name: skill,
                level: "Intermediate"
            };

        }


        return {

            name:
                skill.name ||
                skill.skill ||
                skill.title ||
                "",

            level:
                skill.level ||
                skill.proficiency ||
                skill.requiredLevel ||
                "Intermediate"

        };

    }).filter(
        item => item.name
    );

}


// ============================================================
// REQUIRED LEVEL
// ============================================================

function getRequiredLevel(level) {

    if (
        typeof level === "number"
    ) {

        return Math.max(
            0,
            Math.min(100, level)
        );

    }


    if (!level) {

        return 70;

    }


    const value =
        String(level)
            .toLowerCase()
            .trim();


    if (!isNaN(value)) {

        return Math.max(
            0,
            Math.min(
                100,
                Number(value)
            )
        );

    }


    if (
        value.includes("beginner") ||
        value.includes("basic")
    ) {

        return 50;

    }


    if (
        value.includes("intermediate") ||
        value.includes("medium")
    ) {

        return 70;

    }


    if (
        value.includes("advanced")
    ) {

        return 85;

    }


    if (
        value.includes("expert")
    ) {

        return 95;

    }


    return 70;

}


// ============================================================
// STUDENT SKILL LEVEL
// ============================================================

function getStudentSkillLevel(skillName) {

    const wanted =
        normalize(skillName);


    const found =
        studentSkills.find(
            function (skill) {

                const name =
                    normalize(
                        skill.name ||
                        skill.skill ||
                        skill.title ||
                        ""
                    );

                return skillsMatch(
                    name,
                    wanted
                );

            }
        );


    if (!found) {

        return 0;

    }


    return getStudentPercentage(
        found
    );

}


// ============================================================
// STUDENT PERCENTAGE
// ============================================================

function getStudentPercentage(skill) {

    const value =
        skill.level ??
        skill.proficiency ??
        skill.percentage ??
        skill.score ??
        skill.rating ??
        skill.progress;


    if (
        typeof value === "number"
    ) {

        /*
            If rating is 1-5,
            convert to percentage.
        */

        if (
            value >= 1 &&
            value <= 5
        ) {

            return Math.round(
                value * 20
            );

        }

        return Math.round(
            Math.max(
                0,
                Math.min(100, value)
            )
        );

    }


    if (
        typeof value === "string"
    ) {

        const clean =
            value.trim()
                .toLowerCase();


        if (
            clean.includes("%")
        ) {

            const number =
                parseFloat(clean);

            if (!isNaN(number)) {

                return Math.round(
                    Math.max(
                        0,
                        Math.min(100, number)
                    )
                );

            }

        }


        return getRequiredLevel(
            clean
        );

    }


    return 0;

}


// ============================================================
// SKILL MATCH
// ============================================================

function skillsMatch(a, b) {

    if (!a || !b) {
        return false;
    }


    if (a === b) {
        return true;
    }


    const aliases = {

        "node.js": [
            "nodejs",
            "node js"
        ],

        "nodejs": [
            "node.js",
            "node js"
        ],

        "javascript": [
            "js"
        ],

        "js": [
            "javascript"
        ],

        "mongodb": [
            "mongo",
            "mongo db"
        ],

        "rest api": [
            "api",
            "rest",
            "restful api"
        ],

        "data structures": [
            "dsa",
            "data structures and algorithms"
        ],

        "dsa": [
            "data structures",
            "algorithms"
        ],

        "git": [
            "github"
        ]

    };


    if (
        aliases[a] &&
        aliases[a].includes(b)
    ) {

        return true;

    }


    if (
        aliases[b] &&
        aliases[b].includes(a)
    ) {

        return true;

    }


    return (
        a.includes(b) ||
        b.includes(a)
    );

}


// ============================================================
// NORMALIZE
// ============================================================

function normalize(value) {

    return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

}


// ============================================================
// RENDER SKILL REQUIREMENTS
// ============================================================

function renderSkillRequirements() {

    const container =
        document.getElementById(
            "skillGapList"
        );


    if (!container) {
        return;
    }


    if (
        skillRequirements.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state"
                 style="grid-column:1/-1;">

                <strong>
                    No skill requirements found
                </strong>

                Add or explore some opportunities
                to get personalized learning recommendations.

            </div>
        `;

        return;

    }


    container.innerHTML =
        skillRequirements
            .slice(0, 8)
            .map(function (skill) {

                let badge;
                let badgeClass;
                let button;

                if (skill.status === "must") {

                    badge = "MUST LEARN";
                    badgeClass = "must-learn";
                    button = "Start Learning";

                } else if (
                    skill.status === "improve"
                ) {

                    badge = "IMPROVE";
                    badgeClass = "improve";
                    button = "Improve Skill";

                } else {

                    badge = "REQUIREMENT MET";
                    badgeClass = "met";
                    button = "Requirement Met";

                }


                const message =
                    skill.status === "must"
                        ? "This skill is required but missing."
                        : skill.status === "improve"
                            ? `Improve by ${skill.required - skill.current}% to meet requirements.`
                            : "Your current level meets the requirement.";


                const buttonAction =
                    skill.status === "met"
                        ? ""
                        : `onclick="learnSkill('${escapeJs(skill.name)}')"`;



                return `

                    <div class="skill-card">

                        <div class="skill-card-top">

                            <div>

                                <div class="skill-name">
                                    ${escapeHtml(skill.name)}
                                </div>

                                <div class="skill-meta">
                                    Required by
                                    ${skill.opportunities}
                                    opportunit${skill.opportunities === 1 ? "y" : "ies"}
                                </div>

                            </div>


                            <span
                                class="status-badge ${badgeClass}"
                            >
                                ${badge}
                            </span>

                        </div>


                        <div class="progress-area">

                            <div class="progress-labels">

                                <span>
                                    Your level:
                                    <strong>
                                        ${skill.current}%
                                    </strong>
                                </span>

                                <span>
                                    Required:
                                    <strong>
                                        ${skill.required}%
                                    </strong>
                                </span>

                            </div>


                            <div class="progress-bar">

                                <div
                                    class="progress-fill"
                                    style="width:${skill.current}%"
                                ></div>

                            </div>

                        </div>


                        <div class="skill-footer">

                            <span class="required-text">
                                ${escapeHtml(message)}
                            </span>


                            <button
                                class="learn-btn ${skill.status === "met" ? "done" : ""}"
                                ${buttonAction}
                            >
                                ${button}
                            </button>

                        </div>

                    </div>

                `;

            })
            .join("");

}


// ============================================================
// LEARN SKILL
// ============================================================

function learnSkill(skillName) {

    const wanted =
        normalize(skillName);


    const course =
        courses.find(
            function (item) {

                return item.skills.some(
                    function (courseSkill) {

                        return skillsMatch(
                            normalize(courseSkill),
                            wanted
                        );

                    }
                );

            }
        );


    if (!course) {

        showToast(
            "Learning material for " +
            skillName +
            " will be added soon."
        );

        return;

    }


    const card =
        document.querySelector(
            `[data-course-id="${course.id}"]`
        );


    if (card) {

        card.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }


    startCourse(course.id);

}


// ============================================================
// COURSE PROGRESS STORAGE
// ============================================================

function getProgress(courseId) {

    let data = {};

    try {

        data =
            JSON.parse(
                localStorage.getItem(
                    "skillbridgeLearningProgress"
                ) || "{}"
            );

    } catch (error) {

        data = {};

    }


    return Number(
        data[courseId] || 0
    );

}


function saveProgress(
    courseId,
    progress
) {

    let data = {};

    try {

        data =
            JSON.parse(
                localStorage.getItem(
                    "skillbridgeLearningProgress"
                ) || "{}"
            );

    } catch (error) {

        data = {};

    }


    data[courseId] =
        progress;


    localStorage.setItem(
        "skillbridgeLearningProgress",
        JSON.stringify(data)
    );

}


// ============================================================
// START COURSE
// ============================================================

function startCourse(courseId) {

    const course =
        courses.find(
            function (item) {

                return item.id === courseId;

            }
        );


    if (!course) {
        return;
    }


    let progress =
        getProgress(courseId);


    if (progress >= 100) {

        showToast(
            "✓ " +
            course.title +
            " is already completed."
        );

        return;

    }


    progress =
        Math.min(
            progress + 20,
            100
        );


    saveProgress(
        courseId,
        progress
    );


    renderCourses(
        getFilteredCourses()
    );


    updateStats();


    if (progress >= 100) {

        showToast(
            "🎉 " +
            course.title +
            " completed!"
        );

    } else {

        showToast(
            course.title +
            " progress: " +
            progress +
            "%"
        );

    }

}


// ============================================================
// RENDER COURSES
// ============================================================

function renderCourses(courseList) {

    const container =
        document.getElementById(
            "courseGrid"
        );


    if (!container) {
        return;
    }


    if (
        courseList.length === 0
    ) {

        container.innerHTML = `

            <div
                class="empty-state"
                style="grid-column:1/-1;"
            >

                <strong>
                    No courses found
                </strong>

                Try another search or category.

            </div>

        `;

        return;

    }


    container.innerHTML =
        courseList.map(
            function (course) {

                const progress =
                    getProgress(
                        course.id
                    );


                let buttonText =
                    "Start Learning";


                let buttonClass =
                    "";


                if (progress > 0 && progress < 100) {

                    buttonText =
                        "Continue Learning";

                }


                if (progress >= 100) {

                    buttonText =
                        "✓ Completed";

                    buttonClass =
                        "completed";

                }


                return `

                    <div
                        class="course-card"
                        data-course-id="${course.id}"
                    >

                        <div class="course-icon">
                            ${course.icon}
                        </div>


                        <div class="course-category">
                            ${escapeHtml(course.category)}
                        </div>


                        <div class="course-title">
                            ${escapeHtml(course.title)}
                        </div>


                        <div class="course-description">
                            ${escapeHtml(course.description)}
                        </div>


                        <div class="course-info">

                            <span>
                                ◷ ${course.duration}
                            </span>

                            <span>
                                ◉ ${course.level}
                            </span>

                        </div>


                        <div class="course-progress">

                            <div class="course-progress-text">

                                <span>
                                    Progress
                                </span>

                                <strong>
                                    ${progress}%
                                </strong>

                            </div>


                            <div class="progress-bar">

                                <div
                                    class="progress-fill"
                                    style="width:${progress}%"
                                ></div>

                            </div>

                        </div>


                        <div class="course-actions">

                            <button
                                class="course-btn ${buttonClass}"
                                onclick="startCourse('${course.id}')"
                            >
                                ${buttonText}
                            </button>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


// ============================================================
// COURSE SEARCH + FILTER
// ============================================================

function setupCourseSearch() {

    const search =
        document.getElementById(
            "courseSearch"
        );


    const filter =
        document.getElementById(
            "categoryFilter"
        );


    if (search) {

        search.addEventListener(
            "input",
            function () {

                renderCourses(
                    getFilteredCourses()
                );

            }
        );

    }


    if (filter) {

        filter.addEventListener(
            "change",
            function () {

                renderCourses(
                    getFilteredCourses()
                );

            }
        );

    }


    const globalSearch =
        document.getElementById(
            "globalSearch"
        );


    if (globalSearch) {

        globalSearch.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    const value =
                        globalSearch.value.trim();


                    if (value) {

                        window.location.href =
                            "opportunities.html?search=" +
                            encodeURIComponent(value);

                    }

                }

            }
        );

    }

}


// ============================================================
// FILTER COURSES
// ============================================================

function getFilteredCourses() {

    const searchElement =
        document.getElementById(
            "courseSearch"
        );


    const filterElement =
        document.getElementById(
            "categoryFilter"
        );


    const search =
        (
            searchElement
                ? searchElement.value
                : ""
        )
            .toLowerCase()
            .trim();


    const category =
        filterElement
            ? filterElement.value
            : "all";


    return courses.filter(
        function (course) {

            const matchesSearch =
                !search ||
                course.title
                    .toLowerCase()
                    .includes(search) ||
                course.description
                    .toLowerCase()
                    .includes(search) ||
                course.skills.some(
                    function (skill) {

                        return skill
                            .toLowerCase()
                            .includes(search);

                    }
                );


            const matchesCategory =
                category === "all" ||
                course.category === category;


            return (
                matchesSearch &&
                matchesCategory
            );

        }
    );

}


// ============================================================
// UPDATE STATISTICS
// ============================================================

function updateStats() {

    let completed = 0;
    let inProgress = 0;


    courses.forEach(
        function (course) {

            const progress =
                getProgress(
                    course.id
                );


            if (progress >= 100) {

                completed++;

            } else if (progress > 0) {

                inProgress++;

            }

        }
    );


    const gaps =
        skillRequirements.filter(
            function (skill) {

                return skill.status !== "met";

            }
        ).length;


    const courseCount =
        document.getElementById(
            "courseCount"
        );


    const learningCount =
        document.getElementById(
            "learningCount"
        );


    const skillGapCount =
        document.getElementById(
            "skillGapCount"
        );


    const skillCount =
        document.getElementById(
            "skillCount"
        );


    if (courseCount) {

        courseCount.textContent =
            completed;

    }


    if (learningCount) {

        learningCount.textContent =
            inProgress;

    }


    if (skillGapCount) {

        skillGapCount.textContent =
            gaps;

    }


    if (skillCount) {

        skillCount.textContent =
            studentSkills.length;

    }

}


// ============================================================
// JOB READINESS
// ============================================================

function calculateReadiness() {

    const element =
        document.getElementById(
            "jobReadiness"
        );


    if (!element) {
        return;
    }


    if (
        skillRequirements.length === 0
    ) {

        element.textContent =
            "0%";

        return;

    }


    let total = 0;


    skillRequirements.forEach(
        function (skill) {

            let score =
                skill.current /
                skill.required *
                100;


            score =
                Math.min(
                    score,
                    100
                );


            total += score;

        }
    );


    const readiness =
        Math.round(
            total /
            skillRequirements.length
        );


    element.textContent =
        readiness + "%";

}


// ============================================================
// LOGOUT
// ============================================================

function setupLogout() {

    const logoutButton =
        document.getElementById(
            "logoutBtn"
        );


    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            logout();

        }
    );

}


function logout() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );

    window.location.href =
        "login.html";

}


// ============================================================
// TOAST
// ============================================================

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {
        return;
    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );

        },
        2200
    );

}


// ============================================================
// SECURITY HELPERS
// ============================================================

function escapeHtml(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeJs(value) {

    return String(value || "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}