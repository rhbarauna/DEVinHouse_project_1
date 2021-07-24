function loadInitialList() {
  tasks.forEach(function (task) {
    var lineElement = createLineElement(task);
    addNewLineElement(lineElement);
  });
}

function getFieldValue() {
  var field = taskTitleInputElement;
  var fieldValue = field.value.trim();

  if (!fieldValue) {
    field.focus();
    throw new Error('Invalid field value')
  }

  return fieldValue;
}

function getSavedTasks() {
  var savedTasks = localStorage.getItem('taskList');
  if (!savedTasks) {
    return [];
  }
  return JSON.parse(savedTasks);
}

function verifyTaskByTitle(taskTitle) {
  var exists = tasks.filter(function (task) {
    return task.title == taskTitle;
  });
  if (exists.length > 0) {
    throw new Error("Task already exists");
  }
}

function createLineElement(task) {
  var newLine = document.createElement('li');
  newLine.classList.add("item");
  newLine.id = "task_" + task.id;

  var checkbox = document.createElement('input');
  checkbox.type = "checkbox";
  checkbox.checked = task.isDone;
  checkbox.onchange = function () {
    updateTaskStatus(task);
  }

  var lineDescription = document.createElement('span');
  lineDescription.innerText = task.title;

  if (task.isDone) {
    lineDescription.classList.add('done');
  }

  var deleteButton = createDeleteButtonElement(task);

  newLine.appendChild(checkbox);
  newLine.appendChild(lineDescription);
  newLine.appendChild(deleteButton);

  return newLine;
}

function createDeleteButtonElement(task){
  var button = createTaskActionButtonElement("Excluir", task, function() {
    var confirmExclusion = confirm("Deseja excluir: " + task.title);
    if(!confirmExclusion){
      return;
    }
    
    removeLineElement(task);
    removeRegistry(task)
  });
  button.classList.add('danger');
  button.title = "Botão para excluir a tarefa: "+ task.title;
  return button;
}

function createTaskActionButtonElement(title, task, action = ()=>{}){
  var button = document.createElement('button');
  button.innerText = title;
  button.onclick = action;
  button.classList.add('btn', 'btn-small');
  return button;
}

function addNewLineElement(newLine) {
  todoList.appendChild(newLine);
  hideEmptyListAlert();
}

function updateTaskList(task) {
  var oldTask = tasks.filter(function (tsk) {
    return tsk.id == task.id;
  });

  if (oldTask.length > 0) {
    var oldTaskIndex = tasks.indexOf(oldTask);
    tasks[oldTaskIndex] = task;
    return;
  }
  tasks.push(task)
}

function resetForm() {
  form.reset();
  taskTitleInputElement.focus();
}

function removeLineElement(task) {
  var line = document.getElementById("task_" + task.id); 
  line.classList.add('fadeOut');
  setTimeout( function() {
    line.remove();

    if(checkIfListIsEmpty()){
      showEmptyListAlert();
    }
  }, 500);
}

function removeRegistry(task) {
  tasks = tasks.filter(
    function (tsk) {
      return tsk.id !== task.id;
    }
  );
  persistTasks();
}

function persistTasks() {
  localStorage.setItem("taskList", JSON.stringify(tasks));
}

function updateTaskStatus(task) {
  task.isDone = !task.isDone;
  updateTaskList(task);
  persistTasks();

  document.querySelector('#task_' + task.id + ' span').classList.toggle('done');
}

function onSubmitEventListener(event) {
  event.preventDefault();

  try {
    var taskTitle = getFieldValue("taskTitle");
    verifyTaskByTitle(taskTitle);

    var newTask = {
      id: tasks.length + 1,
      title: taskTitle,
      isDone: false
    };
    var newLine = createLineElement(newTask);
    addNewLineElement(newLine);
    updateTaskList(newTask);
    persistTasks();
    resetForm();
  } catch (error) {
    if (error.message === "Invalid field value") {
      alert("Favor preencher a tarefa");
      return;
    }
    if (error.message === "Task already exists") {
      alert("Item já adicionado na lista");
      return;
    }
    console.error(error);
  }
}
function checkIfListIsEmpty() {
  return todoList.childElementCount == 0;
}

function hideEmptyListAlert(){
  emptyListAlert.classList.add('hidden');
}
function showEmptyListAlert(){
  emptyListAlert.classList.remove('hidden');
}

var form = document.querySelector('form');
var taskTitleInputElement = document.getElementById('taskTitle');
var todoList = document.getElementById('todoList');
var emptyListAlert = document.getElementById('emptyListAlert');
var tasks = getSavedTasks();
loadInitialList();

form.addEventListener('submit', onSubmitEventListener);