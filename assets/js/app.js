const cl = console.log;
// form-controls
const todoForm = document.getElementById("todoForm");
const todoName = document.getElementById("todoName");
const isCompleted = document.getElementById("isCompleted");

// Container
const todoContainer = document.getElementById("todoContainer");

// buttons
const addTodoBtn = document.getElementById("addTodoBtn");
const updateTodoBtn = document.getElementById("updateTodoBtn");

// spinner
const spinner = document.getElementById("spinner");

const BASE_URL = `https://todo-crud-async-await-generic-default-rtdb.firebaseio.com`;

const TODO_URL = `${BASE_URL}/todo1.json`;

let state = {
  todoArr: [],
  editId: null,
};

// Functions

function popup(msg, icon) {
  Swal.fire({
    text: msg,
    icon: icon,
    timer: 1800,
  });
}

// arrOfObj

function objToArr(obj) {
  let arr = Object.entries(obj);
  let arrofMovie = arr.map((movie) => {
    movie[1].id = movie[0];
    state.todoArr.push(movie[1]);
    cl(state.todoArr);
  });

  // for (const key in obj) {
  //   obj[key].id = key;
  //   state.todoArr.push(obj(key));
  // }
}

// spinner

function showSpinner(flag) {
  if (flag) {
    spinner.classList.remove("d-none");
  } else {
    spinner.classList.add("d-none");
  }
}

// snackbar

function snackbar(msg, icon) {
  Swal.fire({
    text: msg,
    icon: icon,
  });
}

// Create

async function onTodoAdd(event) {
  event.preventDefault();

  let newTodo = {
    todoItem: todoName.value.trim(),
    isCompleted: isCompleted.value === "yes" ? true : false,
  };

  showSpinner(true);

  try {
    let res = await fetch(TODO_URL, {
      method: "POST",
      body: JSON.stringify(newTodo),
      headers: {
        "Content-Type": "application/json",
        Auth: "JWT TOKEN",
      },
    });

    let data = await res.json();

    newTodo.id = data.name;

    state.todoArr.push(newTodo);

    createLI(newTodo);

    todoForm.reset();
  } catch (err) {
    snackbar(err, "error");
  } finally {
    showSpinner(false);
  }
}

// creatLI

function createLI(newTodo) {
  let li = document.createElement("li");

  li.className = `list-group-item d-flex justify-content-between`;

  li.id = newTodo.id;

  li.innerHTML = `
    <div>
        <input type="checkbox" onclick="onTodoCompletedChange(this)" ${newTodo.isCompleted ? `checked` : ""}>
        <strong>${newTodo.todoItem}</strong>
    </div>
    <div>
      <button onclick="onTodoEdit(this)" class="btn btn-sm btn-primary">Edit</button>
      <button onclick="onTodoRemove(this)" class="btn btn-sm btn-danger deleteBtn">Delete</button>
    </div>
  `;
  todoContainer.append(li);
}

// read

async function showOnUI() {
  try {
    showSpinner(true);
    let res = await fetch(TODO_URL, {
      method: "GET",
      body: null,
      headers: {
        "Content-Type": "application/json",
        Authorization: "JWT TOKEN",
      },
    });

    let data = await res.json();

    objToArr(data);

    rendering(state.todoArr);
  } catch {
    snackbar(error, "error");
  } finally {
    showSpinner(false);
  }
}

showOnUI();

// rendering

function rendering(arr) {
  let result = "";

  arr.forEach((ele) => {
    result += `
    <li class="list-group-item d-flex justify-content-between" id="${ele.id}">
        <div>
            <input type="checkbox" onclick="onTodoCompletedChange(this)" ${ele.isCompleted ? `checked` : ""}>
            <strong>${ele.todoItem}</strong>
        </div>
        <div>
          <button onclick="onTodoEdit(this)" class="btn btn-sm btn-primary">Edit</button>
          <button onclick="onTodoRemove(this)" class="btn btn-sm btn-danger deleteBtn">Delete</button>
        </div>
    </li>
    `;
  });
  todoContainer.innerHTML = result;
}

// edit

function onTodoEdit(ele) {
  let editId = ele.closest("li").id;
  state.editId = editId;

  let allDeleteBtn = document.querySelectorAll(".deleteBtn");
  allDeleteBtn.forEach((delBtn) => {
    delBtn.disabled = false;
  });

  let li = document.getElementById(editId);
  let deleteBtn = li.querySelector(".deleteBtn");
  deleteBtn.disabled = true;

  let obj = state.todoArr.find((ele) => ele.id === editId);

  todoName.value = obj.todoItem;
  isCompleted.value = obj.isCompleted ? "yes" : "no";

  addTodoBtn.classList.add("d-none");
  updateTodoBtn.classList.remove("d-none");
}

// update

async function onTodoUpdate() {
  try {
    let updateId = state.editId;

    let updatedObj = {
      id: updateId,
      todoItem: todoName.value,
      isCompleted: isCompleted.value === "yes" ? true : false,
    };

    let UPDATE_URL = `${BASE_URL}/todo1/${updateId}.json`;

    let res = await fetch(UPDATE_URL, {
      method: "PATCH",
      body: JSON.stringify(updatedObj),
      headers: {
        "Content-Type": "application/json",
        Authorization: "JWT TOKEN",
      },
    });

    let data = await res.json();

    let getIndex = state.todoArr.findIndex((ele) => ele.id === updateId);
    state.todoArr[getIndex] = updatedObj;

    updateUI(data);

    updateTodoBtn.classList.add("d-none");
    addTodoBtn.classList.remove("d-none");
    state.editId = null;
    todoForm.reset();
  } catch {
  } finally {
    showSpinner(false);
  }
}

// updateUI

function updateUI(data) {
  let li = document.getElementById(data.id);

  li.innerHTML = `
    <div>
        <input type="checkbox" onclick="onTodoCompletedChange(this)" ${data.isCompleted ? `checked` : ""}>
        <strong>${data.todoItem}</strong>
    </div>
    <div>
      <button onclick="onTodoEdit(this)" class="btn btn-sm btn-primary">Edit</button>
      <button onclick="onTodoRemove(this)" class="btn btn-sm btn-danger deleteBtn">Delete</button>
    </div>
  `;
}

// Remove

async function onTodoRemove(ele) {
  try {
    let result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      let removeId = ele.closest("li").id;

      let REMOVE_URL = `${BASE_URL}/todo1/${removeId}.json`;

      showSpinner(true);
      let res = await fetch(REMOVE_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "Application/json",
          Authorization: "JWT TOKEN",
        },
      });

      let data = await res.json();

      cl(data);

      let index = state.todoArr.findIndex((ele) => ele.id === removeId);
      state.todoArr.splice(index, 1);

      ele.closest("li").remove();
      showSpinner(false);
    }
  } catch {
  } finally {
    showSpinner(false);
  }
}

// onTodoCompletedChange

async function onTodoCompletedChange(ele) {
  let todoId = ele.closest("li").id;

  let UPDATE_URL = `${BASE_URL}/todo1/${todoId}.json`;

  let res = await fetch(UPDATE_URL, {
    method: "PATCH",
    body: JSON.stringify({ isCompleted: ele.checked }),
    headers: {
      "Content-Type": "Application/json",
      Authorization: "JWT TOKEN",
    },
  });

  let data = await res.json();
  cl(data);

  let getIndex = state.todoArr.findIndex((ele) => ele.id === todoId);

  state.todoArr[getIndex].isCompleted = ele.checked;
}

todoForm.addEventListener("submit", onTodoAdd);
updateTodoBtn.addEventListener("click", onTodoUpdate);
