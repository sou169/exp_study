document.addEventListener('DOMContentLoaded', () => {
    const usersTableBody = document.querySelector('#usersTable tbody');
    const joinUsTableBody = document.querySelector('#joinUsTable tbody');

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

    function populateUsersTable(users) {
        usersTableBody.innerHTML = ''; // Clear existing rows
        users.forEach(user => {
            const row = usersTableBody.insertRow();
            row.innerHTML = `
                <td>${user._id}</td>
                <td>${user.email}</td>
                <td>${user.role || 'user'}</td>
                <td>
                    <button class="delete-user-btn" data-id="${user._id}">Delete</button>
                </td>
            `;
        });
        addDeleteEventListeners('delete-user-btn', deleteUser);
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
            const row = joinUsTableBody.insertRow();
            row.innerHTML = `
                <td>${entry._id}</td>
                <td>${entry.email}</td>
                <td>${entry.name}</td>
                <td>${entry.message}</td>
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

    function addDeleteEventListeners(buttonClass, deleteFunction) {
        document.querySelectorAll(`.${buttonClass}`).forEach(button => {
            button.addEventListener('click', (event) => {
                const id = event.target.dataset.id;
                deleteFunction(id);
            });
        });
    }

    // Fetch data when the page loads
    fetchUsers();
    fetchJoinUs();
});