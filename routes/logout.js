const express = require('express');
const router = express.Router();

// LOGOUT ROUTE
router.get('/', (req, res) => {
    req.logout();
    req.flash('success', 'See you later!');
    res.redirect('/');
});


module.exports = router;