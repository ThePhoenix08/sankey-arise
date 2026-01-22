const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoListUL = document.getElementById('todo-list');
const modalOverlay = document.getElementById('modal-overlay');
const modalTaskInput = document.getElementById('modal-task-input');
const modalDateInput = document.getElementById('modal-date-input');
const modalTitle = document.getElementById('modal-title');
const speechBubble = document.getElementById('speech-bubble');
const speechText = document.getElementById('speech-text');

const CHECKBOX_SVG = `<svg fill="transparent" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
  <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
</svg>`;

const EDIT_BUTTON_SVG = `
  <svg fill="var(--secondary-color)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
    <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
  </svg>
`;

const DELETE_BUTTON_SVG = `
  <svg fill="var(--secondary-color)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
    <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
  </svg>
`;

let allTodos = getTodos();
let editingIndex = -1;

updateTodoList();
updateProgress();
showWelcomeMessage();

todoForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (text.length > 0) {
    modalTaskInput.value = text;
    modalTitle.textContent = 'Add Task';
    editingIndex = -1;
    modalOverlay.classList.add('active');
    todoInput.value = "";
  }
});

function openModal(todoIndex = -1) {
  if (todoIndex >= 0) {
    modalTitle.textContent = 'Edit Task';
    modalTaskInput.value = allTodos[todoIndex].text;
    modalDateInput.value = allTodos[todoIndex].dueDate || '';
    editingIndex = todoIndex;
  } else {
    modalTitle.textContent = 'Add Task';
    modalTaskInput.value = '';
    modalDateInput.value = '';
    editingIndex = -1;
  }
  modalOverlay.classList.add('active');
}

function closeModal() {
  modalOverlay.classList.remove('active');
  modalTaskInput.value = '';
  modalDateInput.value = '';
  editingIndex = -1;
}

function saveTask() {
  const text = modalTaskInput.value.trim();
  const dueDate = modalDateInput.value;

  if (text.length > 0) {
    if (editingIndex >= 0) {
      allTodos[editingIndex].text = text;
      allTodos[editingIndex].dueDate = dueDate;
    } else {
      const todoObject = {
        text: text,
        completed: false,
        dueDate: dueDate
      };
      allTodos.push(todoObject);
      showMascotMessage("Great! Let's crush this task! 💪");
    }
    saveTodos();
    updateTodoList();
    updateProgress();
    closeModal();
  }
}

function updateTodoList() {
  todoListUL.innerHTML = "";
  allTodos.forEach((todo, todoIndex) => {
    const todoItem = createTodoItem(todo, todoIndex);
    todoListUL.append(todoItem);
  });
}

function createTodoItem(todo, todoIndex) {
  const todoId = "todo-" + todoIndex;
  const todoLI = document.createElement("li");
  const todoText = todo.text;
  todoLI.className = "todo";

  let dueDateHTML = '';
  if (todo.dueDate) {
    const dueDate = new Date(todo.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isOverdue = dueDate < today && !todo.completed;
    dueDateHTML = `<span class="todo-due-date ${isOverdue ? 'overdue' : ''}">📅 ${dueDate.toLocaleDateString()}</span>`;
  }

  function createTodoElement(todoId, todoText, dueDateHTML) {
    const todoLI = document.createElement("li");

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = todoId;

    // Custom checkbox label with checkmark SVG
    const checkboxLabel = document.createElement("label");
    checkboxLabel.className = "custom-checkbox";
    checkboxLabel.htmlFor = todoId;
    checkboxLabel.innerHTML = CHECKBOX_SVG;

    const textLabel = document.createElement("label");
    textLabel.className = "todo-text";
    textLabel.htmlFor = todoId;
    textLabel.innerHTML = `${todoText}${dueDateHTML}`;

    const editButton = document.createElement("button");
    editButton.className = "edit-button";
    editButton.innerHTML = EDIT_BUTTON_SVG;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.innerHTML = DELETE_BUTTON_SVG;

    todoLI.append(checkbox, checkboxLabel, textLabel, editButton, deleteButton);

    return todoLI;
  }

  const todoElement = createTodoElement(todoId, todoText, dueDateHTML);
  todoLI.append(...todoElement.childNodes);

  const deleteButton = todoLI.querySelector(".delete-button");
  deleteButton.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteTodoItem(todoIndex);
  });

  const editButton = todoLI.querySelector(".edit-button");
  editButton.addEventListener("click", (e) => {
    e.stopPropagation();
    openModal(todoIndex);
  });

  const checkbox = todoLI.querySelector("input");
  checkbox.addEventListener("change", () => {
    allTodos[todoIndex].completed = checkbox.checked;
    if (checkbox.checked) {
      showMascotMessage("Awesome! You're crushing it! 🎉");
    }
    saveTodos();
    updateProgress();
  });
  checkbox.checked = todo.completed;

  todoLI.addEventListener('click', (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      updateTodoList();
    }
  });

  return todoLI;
}

function deleteTodoItem(todoIndex) {
  allTodos = allTodos.filter((_, i) => i !== todoIndex);
  saveTodos();
  updateTodoList();
  updateProgress();
}

function updateProgress() {
  const total = allTodos.length;
  const completed = allTodos.filter(t => t.completed).length;

  document.getElementById('progress-number').textContent = `${completed}/${total}`;

  const circle = document.getElementById('progress-circle');
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? (completed / total) : 0;
  const offset = circumference - (progress * circumference);

  circle.style.strokeDashoffset = offset;
}

function showMascotMessage(message) {
  speechText.textContent = message;
  speechBubble.classList.add('active');
  setTimeout(() => {
    speechBubble.classList.remove('active');
  }, 1000 + message.length * 50);
}

async function showWelcomeMessage() {
  const MAX_RETRIES = 3;
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      const response = await fetch('https://api.chucknorris.io/jokes/random');
      const data = await response.json();
      const joke = data.value;

      // profanity check
      const res = await fetch('https://vector.profanity.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: joke }),
      });

      const profData = await res.json();

      if (!profData.isProfanity) {
        showMascotMessage(`Welcome! Here's a joke: ${joke}`);
        return;
      } else {
        attempts++;
        console.warn(`Profanity detected in joke (attempt ${attempts}). Retrying...`);
      }
    } catch (error) {
      console.error(`Error fetching joke (attempt ${attempts + 1}):`, error);
      attempts++;
    }
  }

  showMascotMessage("Looks like Chuck Norris only knows spicy jokes today 😅 Let's get to work instead! 💪");
}


function saveTodos() {
  const todosJson = JSON.stringify(allTodos);
  try {
    localStorage.setItem("todos", todosJson);
  } catch (e) {
    console.log('Storage not available');
  }
}

function getTodos() {
  try {
    const todos = localStorage.getItem("todos") || "[]";
    return JSON.parse(todos);
  } catch (e) {
    return [];
  }
}

// Close modal on outside click
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});