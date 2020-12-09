const express = require('express');

const router = express.Router();

// Landing page route
router.get('/', (req, res) => {
    res.status(200).render('landing', {
        title: 'Home Page'
    });
});

module.exports = router;