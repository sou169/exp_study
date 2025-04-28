const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));

// Sample user data
let users = [
    { id: 1, name: 'user1', email: 'user1@example.com' },
    { id: 2, name: 'user2', email: 'user2@example.com' }
];

// GET /api/users
app.get('/api/users', (req, res) => {
    res.json(users);
});

// POST /api/delete
app.post('/api/delete', (req, res) => {
    const deleteIds = req.body.delete_ids;
    if (!deleteIds || !Array.isArray(deleteIds)) {
        return res.status(400).send('Invalid delete_ids format');
    }

    users = users.filter(user => !deleteIds.includes(String(user.id)));
    res.send('Users deleted');
});



app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});