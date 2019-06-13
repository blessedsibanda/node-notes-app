var express = require('express');
var router = express.Router();
const notes = require('../models/notes-memory');

/* GET home page. */
router.get('/', async function(req, res, next) {
  let keylist = await notes.keylist();
  let keyPromises = keylist.map(key => {
    return notes.read(key);
  });
  let notelist = await Promise.all(keyPromises);
  res.render('index', { title: 'Notes', notelist: notelist });
});

module.exports = router;
