const form = document.getElementById("task-form");
const input = document.getElementById("new-task");
const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");
const ampmInput = document.getElementById("ampm");

const pendingList = document.getElementById("pending-list");
const upcomingList = document.getElementById("upcoming-list");
const completedList = document.getElementById("completed-list");

let tasks = [];

requestNotificationPermission();

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const text = input.value.trim();
  const date = dateInput.value;
  const time = timeInput.value;
  const ampm = ampmInput.value;

  if (!text || !date || !time) return;

  
  let [hours, minutes] = time.split(":").map(Number);

  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;

  const [year, month, day] = date.split("-").map(Number);
  const due = new Date(year, month - 1, day, hours, minutes);

  if (!isNaN(due.getTime())) {
    const task = {
      id: Date.now(),
      text,
      due,
      completed: false
    };
    tasks.push(task);

    

    scheduleNotification(task);
    renderTasks();
  }
});

function renderTasks() {
  pendingList.innerHTML = "";
  upcomingList.innerHTML = "";
  completedList.innerHTML = "";

  const now = new Date();

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.classList.add("task");
    if (task.completed) li.classList.add("completed");

    const header = document.createElement("div");
    header.classList.add("task-header");

    const headerLeft = document.createElement("div");
    headerLeft.classList.add("task-header-left");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      renderTasks();
    });

    const span = document.createElement("span");
    span.textContent = task.text;

    headerLeft.appendChild(checkbox);
    headerLeft.appendChild(span);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "🗑️";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      renderTasks();
    });

    header.appendChild(headerLeft);
    header.appendChild(deleteBtn);

    const taskBody = document.createElement("div");
    taskBody.classList.add("task-body");

    const timeEl = document.createElement("div");
    timeEl.classList.add("task-time");

    // Convert time to 12-hour format with AM/PM
    const options = { hour: "2-digit", minute: "2-digit", hour12: true };
    timeEl.textContent = `📅 ${task.due.toLocaleDateString()} 🕒 ${task.due.toLocaleTimeString([], options)}`;

    taskBody.appendChild(timeEl);

    li.appendChild(header);
    li.appendChild(taskBody);

    if (task.completed) {
      completedList.appendChild(li);
    } else if (task.due < now) {
      pendingList.appendChild(li);
    } else {
      upcomingList.appendChild(li);
    }
  });
}

function scheduleNotification(task) {
  const delay = task.due.getTime() - Date.now();
  if (delay > 0) {
    setTimeout(() => {
      if (!task.completed && Notification.permission === "granted") {
        new Notification("Reminder", {
          body: `⏰ ${task.text} is due now!`,
        });
      }
    }, delay);
  }
}

function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}

