import _events from './notes-events.mjs'
import util from 'util'

import DBG from 'debug';
const debug = DBG('notes:notes-notes'); 
const error = DBG('notes:error-notes'); 

export const events = _events;

var NotesModule;

async function model() {
    if (NotesModule) return NotesModule;
    NotesModule = await import(`../models/notes-${process.env.NOTES_MODEL}`);
    return NotesModule;
}

export async function create(key, title, body) {
    const note = (await model()).create(key, title, body);
    _events.noteCreated(note);
    return note;
}

export async function update(key, title, body) {
    const note = (await model()).update(key, title, body);
    debug(`note updated ${util.inspect(note)}`);
    _events.noteUpdate(note);
    return note;
}

export async function read(key) {
    return (await model()).read(key);
}

export async function destroy(key) {
    await model().destroy(key);
    _events.noteDestroy({ key });
    return key;
}

export async function keylist() {
    return (await model()).keylist();
}

export async function count() {
    return (await model()).count();
}

export async function close() {
    return (await model()).close();
}