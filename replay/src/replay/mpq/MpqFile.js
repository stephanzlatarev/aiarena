import fs from "fs";
import MpqHeader from "./MpqHeader.js";
import MpqHash from "./MpqHash.js";
import MpqEntry from "./MpqEntry.js";
import MpqStream from "./MpqStream.js";
import MpqTools from "./MpqTools.js";

export default class MpqFile {

  constructor(file) {
    this.buffer = fs.readFileSync(file);
    this.header = new MpqHeader(this.buffer);
    this.blockSize = 0x200 << this.header.blockSize;
    this.entries = new Map();

    const hashes = new Map();
    const hashTable = MpqTools.decryptTable(Buffer.from(this.buffer.buffer, this.header.hashTablePos, this.header.hashTableSize * MpqHash.size), "(hash table)");
    for (let i = 0; i < this.header.hashTableSize; i++) {
      const hash = new MpqHash(hashTable, i * MpqHash.size);
      hashes.set(hash.key, hash);
    }

    const entries = [];
    const entryTable = MpqTools.decryptTable(Buffer.from(this.buffer.buffer, this.header.blockTablePos, this.header.blockTableSize * MpqEntry.size), "(block table)");
    for (let i = 0; i < this.header.blockTableSize; i++) {
      entries.push(new MpqEntry(entryTable, i * MpqEntry.size, this.header.headerOffset));
    }

    const filenames = new MpqStream(this, entries[hashes.get(key("(listfile)")).blockIndex]).read().toString().split("\r\n");
    for (const filename of filenames) {
      const hash = hashes.get(key(filename));

      if (hash) {
        const entry = entries[hash.blockIndex];
        entry.filename = filename;
        this.entries.set(filename, entry);
      }
    }
  }

  read(filename) {
    return new MpqStream(this, this.entries.get(filename)).read();
  }

}

function key(filename) {
  const name1 = MpqTools.hashString(filename, 0x100);
  const name2 = MpqTools.hashString(filename, 0x200);

  return MpqHash.key(name1, name2);
}
