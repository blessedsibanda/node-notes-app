import express from 'express';
import * as notes from '../models/notes'

export const router = express.Router();

import DBG from 'debug';
const debug = DBG('notes:debug-index'); 
const error = DBG('notes:error-index'); 


async function getKeyTitlesList() {
  const keylist = await notes.keylist()
  var keyPromises = keylist.map(key => {
    return notes.read(key).then(note => {
      return {key: note.key, title: note.title}
    })
  })
  return Promise.all(keyPromises)
}

/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    let notelist = await getKeyTitlesList()
    res.render('index', {
      title: 'Notes',
      notelist: notelist,
      user: req.user ? req.user : undefined
    });
  } catch (error) {
    next(error)
  }
});

export function socketio(io) {
  var emitNoteTitles = async () => {
    console.log('emitting')
    const notelist = await getKeyTitlesList() 
    debug(`socketio emitNoteTitles ${util.inspect(notelist)}`);
    io.of('/home').emit('notetitles', { notelist })
  }
  notes.events.on('notecreated', emitNoteTitles)
  notes.events.on('noteupdate', emitNoteTitles)
  notes.events.on('notedestroy', emitNoteTitles)
}
