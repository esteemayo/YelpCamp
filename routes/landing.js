const express = require('express');
const router = express.Router();

// LANDING PAGE ROUTE
router.get('/', (req, res) => {
    res.render('landing');
});


module.exports = router;