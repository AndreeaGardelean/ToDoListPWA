const dbName = "tasks";
const dbVersion = 1;
let db;

const openDatabase = () => {
  const request = window.indexedDB.open(dbName, dbVersion);

  request.onerror = (event) => {
  console.error("Database error: ", event.target.error);
  };

  request.onsuccess = (event) => {
    db = event.target.result;
    console.log("Database opened successfully!");
    readTasks();
  };

  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    const objectStore = db.createObjectStore("tasks",
      { keyPath: "id", autoIncrement: true }
    );

    objectStore.createIndex("name", "name", { unique: false });
    console.log("Database upgraded successfully");
  };
};

const addTask = () => {
  if (!db) {
    console.log("Database not open yet!");
    return;
  }

  const taskName = document.getElementById("enter-task").value;
  const task = { name: taskName };

  const transaction = db.transaction(["tasks"], "readwrite");
  const objectStore = transaction.objectStore("tasks");
  const addItem = objectStore.add(task);

  addItem.onsuccess = (event) => {
    console.log("New task added successfully");
    const addedItem = { name: taskName, id: event.target.result };
    displayTask(addedItem);
  };
      
  addItem.onerror = (event) => {
    console.error("Error while adding task: ", event.target.error);
  };

  transaction.oncomplete = () => {
    console.log("Transaction complete!");
  };

  transaction.onerror = (event) => {
    console.error("Transaction error: ", event.target.error);
  };
};

const readTasks = () => {
  if (!db) {
    console.log("Database not open yet!");
    return;
  }

  const transaction = db.transaction(["tasks"], "readonly");
  const objectStore = transaction.objectStore("tasks");
  const getAllData = objectStore.getAll();

  getAllData.onsuccess = (event) => {
    const tasks = event.target.result;
    console.log("Tasks retieved from db: ", tasks);

    tasks.forEach((task) => {
      displayTask(task);
    })
  };

  getAllData.onerror = (event) => {
    console.error("Error retrieving tasks: ", event.target.error);
  };
};

const displayTask = (task) => {
  const container = document.getElementById("tasks-container");
  const item = document.createElement("input");
  item.type = "radio";
  item.id = task.id;

  const itemLabel = document.createElement("label");
  itemLabel.for = task.id;
  itemLabel.textContent = task.name;
  itemLabel.contentEditable = true;

  itemLabel.addEventListener('blur', () => {
    const newText = itemLabel.textContent;
    console.log('Updated label text: ' + newText);
    updateDB(newText, task.id);
  });

  itemLabel.addEventListener('keydown', (event) => {
    if (event.key == "Enter") {
      event.preventDefault();
      const newText = itemLabel.textContent;
      updateDB(newText, task.id);
    }
  });

  const taskContainer = document.createElement("div");
  taskContainer.className = task.id;
  taskContainer.appendChild(item);
  taskContainer.appendChild(itemLabel);

  container.append(taskContainer);

  item.addEventListener("change", (event) => {
    deleteTaskFromDB(task.id);
    deleteTaskFromScreen(task.id);
    console.log("task ", task.name, " with id: ", task.id, " was selected")
  });
};

const deleteTaskFromDB = (taskId) => {
  const transaction = db.transaction(["tasks"], "readwrite");
  const objectStore = transaction.objectStore("tasks");
  const deleteRequest = objectStore.delete(taskId);

  deleteRequest.onsuccess = (event) => {
    console.log("Task deleted successfully!");
  };

  deleteRequest.onerror = (event) => {
    console.error("Error while deleting task: ", event.target.error);
  };
};

const deleteTaskFromScreen = (taskId) => {
  const container = document.getElementById("tasks-container");
  const taskContainer = container.getElementsByClassName(taskId);

  Array.from(taskContainer).forEach((element) => {
    container.removeChild(element);
  });
};


const form = document.getElementById("task-form");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask();
  const inputField = document.getElementById("enter-task");
  inputField.value = "";
});

const updateDB = (newValue, itemID) => {
  const transaction = db.transaction(["tasks"], "readwrite");
  const objectStore = transaction.objectStore("tasks");

  const updatedTask = { name: newValue, id: itemID }
  const updateRequest = objectStore.put(updatedTask);

  updateRequest.onsuccess = () => {
    console.log("Task updated!");
  };

  updateRequest.onerror = (event) => {
    console.error("Task could not be updated: ", event.target.error)
  };

  transaction.oncomplete = () => {
    console.log("Transaction complete");
  };

  transaction.onerror = () => {
    console.error("Transaction failed");
  };
};

const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./ServiceWorker.js")
      .then(function (registration) {
        console.log("Service Worker registered with scope:", registration.scope);
      }).catch(function (err) {
        console.error("Service worker registration failed:", err);
      });
  }
};

registerServiceWorker();
openDatabase();
readTasks();