const express = require('express');
const { StatusCodes } = require('http-status-codes');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(StatusCodes.OK).render('landing', {
    title: 'Home Page',
  });
});

module.exports = router;
