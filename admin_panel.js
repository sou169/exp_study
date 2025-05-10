document.addEventListener('DOMContentLoaded', () => {
    const usersTableBody = document.querySelector('#usersTable tbody');
    const joinUsTableBody = document.querySelector('#joinUsTable tbody');
    const userModal = document.getElementById('userModal');
    const joinUsModal = document.getElementById('joinUsModal');

    async function fetchUsers() {
        try {
            const response = await fetch('/admin/users');
            if (!response.ok) {
                if (response.status === 403) {
                    alert('You do not have permission to access this page.');
                    window.location.href = '/'; // Redirect to home or login page
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const users = await response.json();
            populateUsersTable(users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    function populateUsersTable(users) {usersTableBody.innerHTML = ''; // Clear existing rows
        users.forEach(user => {
            const row = usersTableBody.insertRow();
            row.dataset.id = user._id;
            row.dataset.email = user.email;
            row.dataset.role = user.role || 'user';
            row.innerHTML = `
                <td>${user._id}</td>
                <td>${user.email}</td>
                <td>${user.role || 'user'}</td>
                <td>
                    <button class="delete-user-btn" data-id="${user._id}">Delete</button>
 <button class="edit-user-btn" data-id="${user._id}">Edit</button>
                </td>
            `;
        });
        addDeleteEventListeners('delete-user-btn', deleteUser);
        addEditEventListeners('edit-user-btn', openUserModal);
    }

    function addEditEventListeners(buttonClass, openModalFunction) {
        document.querySelectorAll(`.${buttonClass}`).forEach(button => {
            button.addEventListener('click', openModalFunction);
        });
    }

    async function fetchJoinUs() {
        try {
            const response = await fetch('/admin/joinus');
            if (!response.ok) {
                if (response.status === 403) {
                    // This case is handled by the fetchUsers function, but good to keep consistent
                    alert('You do not have permission to access this page.');
                    window.location.href = '/';
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const joinUsEntries = await response.json();
            populateJoinUsTable(joinUsEntries);
        } catch (error) {
            console.error('Error fetching join us entries:', error);
        }
    }

    function populateJoinUsTable(joinUsEntries) {
        joinUsTableBody.innerHTML = ''; // Clear existing rows
        joinUsEntries.forEach(entry => {
            const row = joinUsTableBody.insertRow();row.dataset.id = entry._id;
            row.dataset.email = entry.email;
            row.dataset.name = entry.name;
            row.dataset.message = entry.message;
            row.innerHTML = `
                <td>${entry._id}</td>
                <td>${entry.email}</td>
                <td>${entry.name}</td>
                <td>${entry.message}</td>
 <td><button class="edit-joinus-btn" data-id="${entry._id}">Edit</button></td>
                <td>
                    <button class="delete-joinus-btn" data-id="${entry._id}">Delete</button>
                </td>
            `;
        });
        addDeleteEventListeners('delete-joinus-btn', deleteJoinUs);
    }


    async function deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch(`/admin/users/${userId}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                alert('User deleted successfully!');
                fetchUsers(); // Refresh the users table
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Failed to delete user.');
            }
        }
    }

    async function deleteJoinUs(entryId) {
        if (confirm('Are you sure you want to delete this join us entry?')) {
            try {
                const response = await fetch(`/admin/joinus/${entryId}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                alert('Join us entry deleted successfully!');
                fetchJoinUs(); // Refresh the join us table
            } catch (error) {
                console.error('Error deleting join us entry:', error);
                alert('Failed to delete join us entry.');
            }
        }
    }

    // User Modal Functions
    const userIdInput = document.getElementById('userId');
    const userEmailInput = document.getElementById('userEmail');
    const userRoleInput = document.getElementById('userRole');
    const userForm = document.getElementById('userForm');
    const closeUserModalBtn = document.querySelector('#userModal .close');

    function openUserModal(event) {
        const row = event.target.closest('tr');
        userIdInput.value = row.dataset.id;
        userEmailInput.value = row.dataset.email;
        userRoleInput.value = row.dataset.role;
        userModal.style.display = 'block';
    }

    function closeUserModal() {
        userModal.style.display = 'none';
        userForm.reset();
    }

    closeUserModalBtn.addEventListener('click', closeUserModal);
    window.addEventListener('click', (event) => {
        if (event.target === userModal) {
            closeUserModal();
        }
    });

    userForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const userId = userIdInput.value;
        const updatedUser = {
            email: userEmailInput.value,
            role: userRoleInput.value
        };
        try {
            const response = await fetch(`/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedUser),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            alert('User updated successfully!');
            closeUserModal();
            fetchUsers(); // Refresh the users table
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user.');
        }
    });

    // Join Us Modal Functions (Similar to User Modal Functions, adapt for join us fields)
    const joinUsIdInput = document.getElementById('joinUsId');
    const joinUsEmailInput = document.getElementById('joinUsEmail');
    const joinUsNameInput = document.getElementById('joinUsName');
    const joinUsMessageInput = document.getElementById('joinUsMessage');
    const joinUsForm = document.getElementById('joinUsForm');
    const closeJoinUsModalBtn = document.querySelector('#joinUsModal .close');

    function openJoinUsModal(event) {
        const row = event.target.closest('tr');
        joinUsIdInput.value = row.dataset.id;
        joinUsEmailInput.value = row.dataset.email;
        joinUsNameInput.value = row.dataset.name;
        joinUsMessageInput.value = row.dataset.message;
        joinUsModal.style.display = 'block';
    }

    function closeJoinUsModal() {
        joinUsModal.style.display = 'none';
        joinUsForm.reset();
    }

    closeJoinUsModalBtn.addEventListener('click', closeJoinUsModal);
    window.addEventListener('click', (event) => {
        if (event.target === joinUsModal) {
            closeJoinUsModal();
        }
    });

    function addDeleteEventListeners(buttonClass, deleteFunction) {
        document.querySelectorAll(`.${buttonClass}`).forEach(button => {
            button.addEventListener('click', (event) => {
                const id = event.target.dataset.id;
                deleteFunction(id);
            });
        });
    }

    // Add New User Button and Form
    const addUserBtn = document.getElementById('addUserBtn');
    const newUserForm = document.getElementById('newUserForm');

    addUserBtn.addEventListener('click', () => {
        // You could open a modal or show a form here for adding a new user
        // For simplicity, let's assume a form is always visible or handled differently
        // This placeholder is just to show the event listener
        console.log('Add New User button clicked');
        // Example: show a modal for adding a new user
        // newUserModal.style.display = 'block';
    });

    // Add New Join Us Entry Button and Form
    const addJoinUsBtn = document.getElementById('addJoinUsBtn');
    const newJoinUsForm = document.getElementById('newJoinUsForm');

    addJoinUsBtn.addEventListener('click', () => {
        // Similar to add user, handle displaying a form/modal
        console.log('Add New Join Us Entry button clicked');
    });

    // Fetch data when the page loads
    fetchUsers();
    fetchJoinUs();
});