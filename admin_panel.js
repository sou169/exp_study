document.addEventListener('DOMContentLoaded', () => {
    const usersTableBody = document.querySelector('#usersTable tbody');
    const joinUsTableBody = document.querySelector('#joinUsTable tbody');

    // Get modals and forms
    const userModal = document.getElementById('userModal');
    const joinUsModal = document.getElementById('joinUsModal');
    const userForm = document.getElementById('userForm');
    const joinUsForm = document.getElementById('joinUsForm');
    const newUserForm = document.getElementById('newUserForm');
    const newJoinUsForm = document.getElementById('newJoinUsForm');

    // Get modal close buttons
    const closeUserModalBtn = userModal.querySelector('.close');
    const closeJoinUsModalBtn = joinUsModal.querySelector('.close');

    // Function to fetch users
    async function fetchUsers() {
        try {
            const response = await fetch('/admin/users');
            if (!response.ok) {
                if (response.status === 403) {
                    alert('You do not have permission to access this page. Please log in as an administrator.');
                    window.location.href = '/login.html'; // Redirect to login page
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const users = await response.json();
            populateUsersTable(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            // Optionally display an error message on the page
        }
    }

    // Function to populate users table
    function populateUsersTable(users) {
        usersTableBody.innerHTML = ''; // Clear existing rows
        users.forEach(user => {
            const row = usersTableBody.insertRow();
            row.dataset.id = user._id;
            row.dataset.email = user.email;
            row.dataset.name = user.name;
            row.dataset.role = user.role || 'user';
            row.innerHTML = `
                <td>${user._id}</td>
                <td>${user.email}</td>
                <td>${user.role || 'user'}</td>
                <td>
                    <button class="btn btn-edit edit-user-btn" data-id="${user._id}">Edit</button>
                    <button class="btn btn-delete delete-user-btn" data-id="${user._id}">Delete</button>
                </td>
            `;
        });
        addDeleteEventListeners('.delete-user-btn', deleteUser);
        addEditEventListeners('.edit-user-btn', openUserModal);
    }

    // Function to fetch join us entries
    async function fetchJoinUs() {
        try {
            const response = await fetch('/admin/joinus');
            if (!response.ok) {
                if (response.status === 403) {
                     alert('You do not have permission to access this page. Please log in as an administrator.');
                    window.location.href = '/login.html'; // Redirect to login page
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const joinUsEntries = await response.json();
            populateJoinUsTable(joinUsEntries);
        } catch (error) {
            console.error('Error fetching join us entries:', error);
             // Optionally display an error message on the page
        }
    }

    // Function to populate join us table
    function populateJoinUsTable(joinUsEntries) {
        joinUsTableBody.innerHTML = ''; // Clear existing rows
        joinUsEntries.forEach(entry => {
            const row = joinUsTableBody.insertRow();
            row.dataset.id = entry._id;
            row.dataset.email = entry.email;
            row.dataset.name = entry.name;
            row.dataset.message = entry.message || '';
            row.innerHTML = `
                <td>${entry._id}</td>
                <td>${entry.email}</td>
                <td>${entry.name}</td>
                <td>${entry.message || ''}</td>
                <td>
                     <button class="btn btn-edit edit-joinus-btn" data-id="${entry._id}">Edit</button>
                    <button class="btn btn-delete delete-joinus-btn" data-id="${entry._id}">Delete</button>
                </td>
            `;
        });
        addDeleteEventListeners('.delete-joinus-btn', deleteJoinUs);
         addEditEventListeners('.edit-joinus-btn', openJoinUsModal);
    }

    // Function to add event listeners for delete buttons
    function addDeleteEventListeners(buttonClass, deleteFunction) {
        document.querySelectorAll(buttonClass).forEach(button => {
            button.addEventListener('click', (event) => {
                const id = event.target.dataset.id;
                deleteFunction(id);
            });
        });
    }

    // Function to add event listeners for edit buttons
    function addEditEventListeners(buttonClass, openModalFunction) {
        document.querySelectorAll(buttonClass).forEach(button => {
            button.addEventListener('click', openModalFunction);
        });
    }


    // --- Delete Functions ---

    async function deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch(`/admin/users/${userId}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                     if (response.status === 403) {
                        alert('You do not have permission to perform this action.');
                        return;
                    }
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
                     if (response.status === 403) {
                        alert('You do not have permission to perform this action.');
                        return;
                    }
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

    // --- User Modal Functions ---

    function openUserModal(event) {
        const row = event.target.closest('tr');
        document.getElementById('userId').value = row.dataset.id;
        document.getElementById('userEmail').value = row.dataset.email;
        document.getElementById('userName').value = row.dataset.name;
        document.getElementById('userRole').value = row.dataset.role;
        userModal.style.display = 'block';
    }

    function closeUserModal() {
        userModal.style.display = 'none';
        userForm.reset();
        document.getElementById('userId').value = ''; // Clear hidden ID
    }

    closeUserModalBtn.addEventListener('click', closeUserModal);
    window.addEventListener('click', (event) => {
        if (event.target === userModal) {
            closeUserModal();
        }
    });

    userForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const userId = document.getElementById('userId').value;
        const updatedUser = {
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            role: document.getElementById('userRole').value,
            password: document.getElementById('userPassword').value // Include password (will be hashed on backend if provided)
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
                 if (response.status === 403) {
                    alert('You do not have permission to perform this action.');
                    return;
                }
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

    // --- Join Us Modal Functions ---

     function openJoinUsModal(event) {
        const row = event.target.closest('tr');
        document.getElementById('joinUsId').value = row.dataset.id;
        document.getElementById('joinUsEmail').value = row.dataset.email;
        document.getElementById('joinUsName').value = row.dataset.name;
        document.getElementById('joinUsMessage').value = row.dataset.message;
        joinUsModal.style.display = 'block';
    }

    function closeJoinUsModal() {
        joinUsModal.style.display = 'none';
        joinUsForm.reset();
        document.getElementById('joinUsId').value = ''; // Clear hidden ID
    }

    closeJoinUsModalBtn.addEventListener('click', closeJoinUsModal);
    window.addEventListener('click', (event) => {
        if (event.target === joinUsModal) {
            closeJoinUsModal();
        }
    });

    joinUsForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const joinUsId = document.getElementById('joinUsId').value;
        const updatedEntry = {
            name: document.getElementById('joinUsName').value,
            email: document.getElementById('joinUsEmail').value,
            message: document.getElementById('joinUsMessage').value
        };

        try {
            const response = await fetch(`/admin/joinus/${joinUsId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedEntry),
            });
            if (!response.ok) {
                 if (response.status === 403) {
                    alert('You do not have permission to perform this action.');
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            alert('Join Us entry updated successfully!');
            closeJoinUsModal();
            fetchJoinUs(); // Refresh the join us table
        } catch (error) {
            console.error('Error updating Join Us entry:', error);
            alert('Failed to update Join Us entry.');
        }
    });


    // --- Add Functions ---

    newUserForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const newUser = {
            name: document.getElementById('newUserName').value,
            email: document.getElementById('newUserEmail').value,
            password: document.getElementById('newUserPassword').value,
            role: document.getElementById('newUserRole').value
        };

        try {
            const response = await fetch('/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });
            if (!response.ok) {
                 if (response.status === 403) {
                    alert('You do not have permission to perform this action.');
                    return;
                }
                 const errorData = await response.json();
                 throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            alert('User added successfully!');
            newUserForm.reset();
            fetchUsers(); // Refresh the users table
        } catch (error) {
            console.error('Error adding user:', error);
            alert('Failed to add user.');
        }
    });

    newJoinUsForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const newJoinUsEntry = {
            name: document.getElementById('newJoinUsName').value,
            email: document.getElementById('newJoinUsEmail').value,
            message: document.getElementById('newJoinUsMessage').value
        };

        try {
            const response = await fetch('/admin/joinus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newJoinUsEntry),
            });
            if (!response.ok) {
                 if (response.status === 403) {
                    alert('You do not have permission to perform this action.');
                    return;
                }
                 const errorData = await response.json();
                 throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            alert('Join Us entry added successfully!');
            newJoinUsForm.reset();
            fetchJoinUs(); // Refresh the join us table
        } catch (error) {
            console.error('Error adding Join Us entry:', error);
            alert('Failed to add Join Us entry.');
        }
    });


    // Fetch data when the page loads
    fetchUsers();
    fetchJoinUs();
});
