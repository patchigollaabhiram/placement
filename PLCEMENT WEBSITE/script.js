
const defaultData = {
  profile: {},
  course: [],
  cert: [],
  project: [],
  semesters: Array(8).fill("")
};

let data;

try {
  data = JSON.parse(localStorage.getItem("klPlacement"));
  if (!data || typeof data !== "object") {
    data = structuredClone(defaultData);
  }
} catch {
  data = structuredClone(defaultData);
}

for (let key of ["course", "cert", "project"]) {
  if (!Array.isArray(data[key])) data[key] = [];
}

if (!Array.isArray(data.semesters)) {
  data.semesters = Array(8).fill("");
}

function saveData() {
  localStorage.setItem("klPlacement", JSON.stringify(data));
}

function showPage(id) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");

  document.querySelectorAll(".sidebar button").forEach(btn => {
    btn.classList.remove("selected");
  });

  const buttons = document.querySelectorAll(".sidebar button");
  const pages = [
    "dashboard", "profile", "courses", "cgpa",
    "certificates", "projects", "placements", "eligibility"
  ];

  buttons[pages.indexOf(id)].classList.add("selected");
}

function saveProfile() {
  data.profile = {
    name: document.getElementById("studentName").value.trim(),
    id: document.getElementById("studentId").value.trim(),
    branch: document.getElementById("studentBranch").value.trim(),
    email: document.getElementById("studentEmail").value.trim()
  };

  saveData();
  document.getElementById("profileMessage").textContent =
    "Profile saved successfully!";
}

function addItem(type) {
  let firstId, secondId;

  if (type === "course") {
    firstId = "courseName";
  } else if (type === "cert") {
    firstId = "certName";
    secondId = "certIssuer";
  } else {
    firstId = "projectName";
    secondId = "projectTech";
  }

  const first = document.getElementById(firstId);
  const second = secondId ? document.getElementById(secondId) : null;

  if (!first.value.trim() || (second && !second.value.trim())) {
    alert("Please fill in all fields.");
    return;
  }

  const item = second
    ? first.value.trim() + " — " + second.value.trim()
    : first.value.trim();

  data[type].push(item);
  first.value = "";
  if (second) second.value = "";

  saveData();
  renderLists();
}

function removeItem(type, index) {
  data[type].splice(index, 1);
  saveData();
  renderLists();
}

function renderLists() {
  const lists = {
    course: "courseList",
    cert: "certList",
    project: "projectList"
  };

  for (let type in lists) {
    const ul = document.getElementById(lists[type]);
    ul.innerHTML = "";

    data[type].forEach((item, index) => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      const button = document.createElement("button");

      span.textContent = item;
      button.textContent = "Delete";
      button.onclick = () => removeItem(type, index);

      li.append(span, button);
      ul.appendChild(li);
    });
  }

  document.getElementById("courseCount").textContent =
    data.course.length;
  document.getElementById("certCount").textContent =
    data.cert.length;
  document.getElementById("projectCount").textContent =
    data.project.length;
}

function createSemesterInputs() {
  const container = document.getElementById("semesterInputs");

  for (let i = 0; i < 8; i++) {
    const wrapper = document.createElement("div");
    const label = document.createElement("label");
    const input = document.createElement("input");

    label.textContent = "Semester " + (i + 1);
    input.type = "number";
    input.min = "0";
    input.max = "10";
    input.step = "0.01";
    input.placeholder = "Enter SGPA";
    input.value = data.semesters[i] ?? "";
    input.id = "sem" + i;

    wrapper.append(label, input);
    container.appendChild(wrapper);
  }
}

function calculateCgpa() {
  let total = 0;
  let count = 0;
  let invalid = false;

  for (let i = 0; i < 8; i++) {
    const value = document.getElementById("sem" + i).value;
    data.semesters[i] = value;

    if (value !== "") {
      const sgpa = Number(value);

      if (!Number.isFinite(sgpa) || sgpa < 0 || sgpa > 10) {
        invalid = true;
        break;
      }

      total += sgpa;
      count++;
    }
  }

  if (invalid) {
    alert("SGPA must be between 0 and 10.");
    return;
  }

  const cgpa = count ? total / count : 0;

  document.getElementById("cgpaResult").textContent =
    "Overall CGPA: " + cgpa.toFixed(2);

  document.getElementById("overallCgpa").textContent =
    cgpa.toFixed(2);

  saveData();
}

function checkEligibility() {
  const values = data.semesters
    .filter(value => value !== "")
    .map(Number);

  const result = document.getElementById("eligibilityResult");

  if (values.length === 0) {
    result.textContent = "Please enter and calculate your SGPA first.";
    return;
  }

  const cgpa = values.reduce((a, b) => a + b, 0) / values.length;

  result.textContent = cgpa >= 7
    ? "✅ Eligible under the demo CGPA rule!"
    : "❌ Below the demo CGPA requirement.";
}

function loadProfile() {
  const p = data.profile || {};

  document.getElementById("studentName").value = p.name || "";
  document.getElementById("studentId").value = p.id || "";
  document.getElementById("studentBranch").value = p.branch || "";
  document.getElementById("studentEmail").value = p.email || "";
}

createSemesterInputs();
loadProfile();
renderLists();
calculateCgpa();
showPage("dashboard");
