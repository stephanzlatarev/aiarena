import MpqBuffer from "./MpqBuffer.js";
import MpqTools from "./MpqTools.js";

export default class MpqStream {

  constructor(file, entry) {
    this.file = file;
    this.entry = entry;

    this.blockSize = file.blockSize;
    this.blockPositions = [0, entry.compressedSize];

    this.currentBlockIndex = -1;
    this.currentData = null;

    if (entry.isCompressed() && entry.isSingleUnit()) {
      this.blockSize = entry.fileSize;
    }
  }

  read() {
    const fileSize = this.entry.fileSize;
    const result = Buffer.alloc(fileSize);

    let offset = 0;
    let readLeft = fileSize;
    let readTotal = 0;

    while (readLeft > 0) {
      const blockIndex = Math.floor(offset / this.blockSize);

      if (blockIndex != this.currentBlockIndex) {
        const expectedLength = Math.floor(Math.min(fileSize - (blockIndex * this.blockSize), this.blockSize));
        const blockOffset = this.entry.isCompressed() ? this.blockPositions[blockIndex] : blockIndex * this.blockSize;
        const blockLength = this.entry.isCompressed() ? this.blockPositions[blockIndex + 1] - blockOffset : expectedLength;
        const blockBuffer = Buffer.from(this.file.buffer.buffer, this.entry.filePos + blockOffset, blockLength);

        if (this.entry.isCompressed() && (blockLength != expectedLength)) {
          this.currentData = MpqTools.decompress(blockBuffer, expectedLength, fileSize);
        } else {
          this.currentData = blockBuffer;
        }

        this.currentBlockIndex = blockIndex;
      }

      const localPosition = (offset % this.blockSize);
      const bytesToCopy = Math.min(this.currentData.length - localPosition, readLeft);

      const read = (bytesToCopy > 0) ? this.currentData.copy(result, readTotal, localPosition, localPosition + bytesToCopy) : 0;

      if (read === 0) break;

      readLeft -= read;
      readTotal += read;
      offset += read;
    }

    return new MpqBuffer(result);
  }

}
