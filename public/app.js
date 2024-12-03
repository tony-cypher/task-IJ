
// DOM Elements
const logoutBtn = document.getElementById('logout-btn');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const priorityFilter = document.getElementById('priority-filter');

// Event Listeners
logoutBtn.addEventListener('click', logout);
addTaskBtn.addEventListener('click', addTask);
searchBtn.addEventListener('click', searchTasks);
priorityFilter.addEventListener('change', fetchTasks);

// Check authentication status on page load
void checkAuth();

async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            credentials: 'include'
        });
        if (response.ok) {
            void fetchTasks();
        } else {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = 'login.html';
    }
}

async function logout() {
    try {
        const response = await fetch(`${API_URL}/users/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            window.location.href = 'login.html';
        } else {
            alert('Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

async function addTask() {
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const deadline = document.getElementById('task-deadline').value;
    const priority = document.getElementById('task-priority').value;

    if (!title || !deadline || !priority) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, deadline, priority }),
            credentials: 'include'
        });

        if (response.ok) {
            fetchTasks();
            clearTaskForm();
        } else {
            alert('Failed to add task');
        }
    } catch (error) {
        console.error('Add task error:', error);
    }
}

async function fetchTasks() {
    const priority = priorityFilter.value;
    let url = `${API_URL}/tasks?`;
    if (priority) url += `priority=${priority}&`;

    try {
        const response = await fetch(url, {
            credentials: 'include'
        });

        if (response.ok) {
            const tasks = await response.json();
            displayTasks(tasks);
        } else {
            throw new Error('Failed to fetch tasks');
        }
    } catch (error) {
        console.error('Fetch tasks error:', error);
    }
}

function displayTasks(tasks) {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.innerHTML = `
            <h3>${escapeHtml(task.title)}</h3>
            <p>${escapeHtml(task.description)}</p>
            <p><strong>Priority:</strong> ${escapeHtml(task.priority)}</p>
            <p><strong>Deadline:</strong> ${new Date(task.deadline).toLocaleDateString()}</p>
            <div class="task-buttons">
                <button class="btn btn-secondary" onclick="editTask('${task._id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="deleteTask('${task._id}')">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </div>
        `;
        taskList.appendChild(taskElement);
    });
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            fetchTasks();
        } else {
            alert('Failed to delete task');
        }
    } catch (error) {
        console.error('Delete task error:', error);
    }
}

async function editTask(taskId) {
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            credentials: 'include'
        });

        if (response.ok) {
            const task = await response.json();
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description;
            document.getElementById('task-deadline').value = task.deadline.split('T')[0];
            document.getElementById('task-priority').value = task.priority;

            const addTaskBtn = document.getElementById('add-task-btn');
            addTaskBtn.textContent = 'Update Task';
            addTaskBtn.onclick = () => updateTask(taskId);
        } else {
            alert('Failed to fetch task details');
        }
    } catch (error) {
        console.error('Edit task error:', error);
    }
}

async function updateTask(taskId) {
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const deadline = document.getElementById('task-deadline').value;
    const priority = document.getElementById('task-priority').value;

    if (!title || !deadline || !priority) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, deadline, priority }),
            credentials: 'include'
        });

        if (response.ok) {
            fetchTasks();
            clearTaskForm();
            const addTaskBtn = document.getElementById('add-task-btn');
            addTaskBtn.textContent = 'Add Task';
            addTaskBtn.onclick = addTask;
        } else {
            alert('Failed to update task');
        }
    } catch (error) {
        console.error('Update task error:', error);
    }
}

async function searchTasks() {
    const searchTerm = searchInput.value;
    const priority = priorityFilter.value;
    let url = `${API_URL}/tasks?search=${encodeURIComponent(searchTerm)}`;
    if (priority) url += `&priority=${priority}`;

    try {
        const response = await fetch(url, {
            credentials: 'include'
        });

        if (response.ok) {
            const tasks = await response.json();
            displayTasks(tasks);
        } else {
            throw new Error('Failed to search tasks');
        }
    } catch (error) {
        console.error('Search tasks error:', error);
    }
}

function clearTaskForm() {
    document.getElementById('task-title').value = '';
    document.getElementById('task-description').value = '';
    document.getElementById('task-deadline').value = '';
    document.getElementById('task-priority').value = '';
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


