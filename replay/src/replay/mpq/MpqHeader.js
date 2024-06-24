
const MPQ_ID = 0x1a51504d;

export default class MpqHeader {

  static size = 32;

  constructor(buffer) {
    for (let offset = 0; offset < buffer.length - 32; offset++) {
      if (buffer.readUInt32LE(offset) === MPQ_ID) {
        this.id = MPQ_ID;
        this.headerOffset = offset;
        this.dataOffset = buffer.readUInt32LE(offset + 4);
        this.archiveSize = buffer.readUInt32LE(offset + 8);
        this.mpqVersion = buffer.readUInt16LE(offset + 12);
        this.blockSize = buffer.readUInt16LE(offset + 14);
        this.hashTablePos = buffer.readUInt32LE(offset + 16) + offset;
        this.blockTablePos = buffer.readUInt32LE(offset + 20) + offset;
        this.hashTableSize = buffer.readUInt32LE(offset + 24);
        this.blockTableSize = buffer.readUInt32LE(offset + 28);
        return;
      }
    }
  }

}
