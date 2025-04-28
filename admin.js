document.getElementById('deleteSelected').onclick = () => {
    const selectedIds = Array.from(document.querySelectorAll('.rowCheckbox:checked')).map(cb => cb.value);
    if (selectedIds.length === 0) {
        Swal.fire('No users selected', '', 'info');
        return;
    }
    Swal.fire({
        title: 'Are you sure?',
        text: `Delete ${selectedIds.length} users?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete them!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/api/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ delete_ids: selectedIds })
            })
            .then(() => location.reload());
        }
    });
};

document.querySelectorAll('.deleteBtn').forEach(button => {
    button.onclick = () => {
        const userId = button.dataset.id;
        Swal.fire({
            title: 'Delete user?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete!'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ delete_ids: [userId] })
                })
                .then(() => location.reload());
            }
        });
    };
});

document.getElementById('selectAll').onclick = function() {
    document.querySelectorAll('.rowCheckbox').forEach(cb => cb.checked = this.checked);
};

document.getElementById('searchInput').oninput = function() {
    const search = this.value.toLowerCase();
    document.querySelectorAll('#userTable tbody tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(search) ? '' : 'none';
    });
};