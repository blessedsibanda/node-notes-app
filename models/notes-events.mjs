import EventEmitter from 'events'

class NotesEmitter extends EventEmitter {
  noteCreated(note) { this.emit('notecreated', note); }
  noteUpdate(note) { this.emit('noteupdate', note); }
  noteDestroy(data) { this.emit('notedestroy', data); }
}

export default new NotesEmitter()