import fs from "fs";
import { addFile } from "./assistant.js";

function getDestination(req, file, cb) {
  cb(null, "/dev/null");
}

class Storage {
  // constructor(opts) {
  //   this.getDestination = opts.destination;
  // }
  _handleFile(req, file, cb) {
    // this.getDestination(req, file, (err, path) => {
    //   if (err) return cb(err);

    // });
    console.log(file.buffer);
    const f = fs.createReadStream('/public/automation.pdf');
    console.log(f);
    //const f = addFile(file.stream);
    //console.log(f.id);
  }
  _removeFile(req, file, cb) { }
}

export default new Storage();



