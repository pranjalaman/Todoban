// Todoban - simple kanban todo app

// Get elements from the page
var form = document.getElementById("task-form");
var input = document.getElementById("task-input");
var columns = document.querySelectorAll(".column");

// Each task looks like: { id: 1, text: "Buy milk", status: "todo" }
var tasks = [];

// The order of the columns (used for the move buttons)
var statuses = ["todo", "doing", "done"];

// The task that is currently being dragged
var draggedId = null;

// Load tasks from localStorage when page opens
function loadTasks() {
  var saved = localStorage.getItem("todoban-tasks");
  if (saved) {
    tasks = JSON.parse(saved);
  }
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("todoban-tasks", JSON.stringify(tasks));
}

// Add a new task
form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop page from reloading

  var text = input.value.trim();
  if (text === "") {
    return;
  }

  var newTask = {
    id: Date.now(),
    text: text,
    status: "todo"
  };

  tasks.push(newTask);
  input.value = "";
  saveTasks();
  showTasks();
});

// Move a task left (-1) or right (+1)
function moveTask(id, direction) {
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      var index = statuses.indexOf(tasks[i].status);
      var newIndex = index + direction;
      if (newIndex >= 0 && newIndex < statuses.length) {
        tasks[i].status = statuses[newIndex];
      }
    }
  }
  saveTasks();
  showTasks();
}

// Delete a task
function deleteTask(id) {
  var newTasks = [];
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id !== id) {
      newTasks.push(tasks[i]);
    }
  }
  tasks = newTasks;
  saveTasks();
  showTasks();
}

// Make one task card (a div) from a task object
function createTaskCard(task) {
  var card = document.createElement("div");
  card.className = "task";
  card.draggable = true;

  var text = document.createElement("p");
  text.textContent = task.text; // textContent is safe from HTML injection
  card.appendChild(text);

  var buttons = document.createElement("div");
  buttons.className = "task-buttons";

  // Left button (not for the first column)
  if (task.status !== "todo") {
    var leftBtn = document.createElement("button");
    leftBtn.textContent = "←";
    leftBtn.addEventListener("click", function () {
      moveTask(task.id, -1);
    });
    buttons.appendChild(leftBtn);
  }

  // Right button (not for the last column)
  if (task.status !== "done") {
    var rightBtn = document.createElement("button");
    rightBtn.textContent = "→";
    rightBtn.addEventListener("click", function () {
      moveTask(task.id, 1);
    });
    buttons.appendChild(rightBtn);
  }

  var deleteBtn = document.createElement("button");
  deleteBtn.textContent = "DELETE";
  deleteBtn.className = "delete-btn";
  deleteBtn.addEventListener("click", function () {
    deleteTask(task.id);
  });
  buttons.appendChild(deleteBtn);

  card.appendChild(buttons);

  // Drag events
  card.addEventListener("dragstart", function () {
    draggedId = task.id;
    card.classList.add("dragging");
  });
  card.addEventListener("dragend", function () {
    card.classList.remove("dragging");
  });

  return card;
}

// Draw all tasks on the page
function showTasks() {
  for (var s = 0; s < statuses.length; s++) {
    var status = statuses[s];
    var list = document.getElementById(status + "-list");
    var count = document.getElementById(status + "-count");

    list.innerHTML = ""; // clear the column
    var number = 0;

    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].status === status) {
        list.appendChild(createTaskCard(tasks[i]));
        number++;
      }
    }

    if (number === 0) {
      var empty = document.createElement("p");
      empty.className = "empty-msg";
      empty.textContent = "Nothing here yet";
      list.appendChild(empty);
    }

    count.textContent = number;
  }
}

// Drag and drop on the columns
for (var c = 0; c < columns.length; c++) {
  var column = columns[c];

  column.addEventListener("dragover", function (event) {
    event.preventDefault(); // needed to allow dropping
    this.classList.add("drag-over");
  });

  column.addEventListener("dragleave", function () {
    this.classList.remove("drag-over");
  });

  column.addEventListener("drop", function (event) {
    event.preventDefault();
    this.classList.remove("drag-over");

    var newStatus = this.dataset.status;
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id === draggedId) {
        tasks[i].status = newStatus;
      }
    }
    saveTasks();
    showTasks();
  });
}

// Start the app
loadTasks();
showTasks();
