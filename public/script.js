let exercises = [];
let currentFilter = "all";

async function fetchExercises() {
  const res = await fetch("/api/exercises");
  exercises = await res.json();
  applyFilter();
  updateProgress();
}

function updateProgress() {
  const doneCount = exercises.filter((exercise) => exercise.isDone === true).length;
  const total = exercises.length;

  document.querySelector(".progress-done").textContent = doneCount;
  document.querySelector(".progress-total").textContent = total;
}

function getFilteredByStatus() {
  if (currentFilter === "done") {
    return exercises.filter((exercise) => exercise.isDone === true);
  }
  if (currentFilter === "undone") {
    return exercises.filter((exercise) => exercise.isDone === false);
  }
  return exercises;
}

function applyFilter() {
  renderExercises(getFilteredByStatus());
}

function searchExercises() {
  const keyword = document.querySelector(".input-search").value.trim();
  const base = getFilteredByStatus();
  if (!keyword) {
    renderExercises(base);
    return;
  }

  const matched = base.filter((exercise) => exercise.name.includes(keyword));
  const rest = base.filter((exercise) => !exercise.name.includes(keyword));

  if (matched.length === 0) {
    alert("존재하지 않는 운동입니다!");
    renderExercises(base);
    return;
  }

  renderExercises([...matched, ...rest]);
}

function renderExercises(data) {
  const listEl = document.querySelector(".exercise-list");
  listEl.innerHTML = "";

  data.forEach((exercise) => {
    const li = document.createElement("li");
    li.className = "exercise-item" + (exercise.isDone ? " is-done" : "");

    li.innerHTML = `
      <label class="exercise-check">
        <input type="checkbox" ${exercise.isDone ? "checked" : ""} />
        <span class="checkmark"></span>
      </label>
      <span class="exercise-name">${exercise.name}</span>
      <span class="exercise-reps">${exercise.reps ?? ""}</span>
      <div class="exercise-actions">
        <button type="button" class="btn btn-edit">수정</button>
        <button type="button" class="btn btn-delete">삭제</button>
      </div>
    `;

    li.querySelector('input[type="checkbox"]')
      .addEventListener("change", (e) => toggleExercise(exercise.id, e.target.checked));
    li.querySelector(".btn-edit")
      .addEventListener("click", () => editExercise(exercise));
    li.querySelector(".btn-delete")
      .addEventListener("click", () => deleteExercise(exercise.id));

    listEl.appendChild(li);
  });
}

async function toggleExercise(id, isDone) {
  await fetch(`/api/exercises/${id}/toggle`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isDone }),
  });

  fetchExercises();
}

async function editExercise(exercise) {
  const name = window.prompt("운동 이름", exercise.name);
  if (name === null) {
    return;
  }

  const reps = window.prompt("세트/횟수", exercise.reps ?? "");
  if (reps === null) {
    return;
  }

  await fetch(`/api/exercises/${exercise.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name.trim(), reps: reps.trim() }),
  });

  fetchExercises();
}

async function deleteExercise(id) {
  await fetch(`/api/exercises/${id}`, {
    method: "DELETE",
  });

  fetchExercises();
}

async function addExercise() {
  const nameInput = document.querySelector(".input-name");
  const repsInput = document.querySelector(".input-reps");

  const name = nameInput.value.trim();
  const reps = repsInput.value.trim();

  if (!name) {
    return;
  }

  await fetch("/api/exercises", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, reps }),
  });

  nameInput.value = "";
  repsInput.value = "";

  fetchExercises();
}

document.querySelector(".btn-add").addEventListener("click", addExercise);

document.querySelector(".btn-search").addEventListener("click", searchExercises);

document.querySelectorAll(".filter-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    currentFilter = tab.dataset.filter;

    document.querySelectorAll(".filter-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    applyFilter();
  });
});

fetchExercises();
