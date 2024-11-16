export class Adapter {
    getInt32(offset, isLittleEndian) {
        if (isLittleEndian) {
            return this.data.readInt32LE(offset);
        } else {
            return this.data.readInt32BE(offset);
        }
    }

    getFloat64(offset, isLittleEndian) {
        if (isLittleEndian) {
            return this.data.readDoubleLE(offset);
        } else {
            return this.data.readDoubleBE(offset);
        }
    }


    getFloat32(offset, isLittleEndian) {
        if (isLittleEndian) {
            return this.data.readFloatLE(offset);
        } else {
            return this.data.readFloatBE(offset);
        }
    }

    /**
     * 
     * @param {Buffer<ArrayBufferLike>} data 
     */
    constructor(data) {
        /**
         * @type {Buffer<ArrayBufferLike>}
         */
        this.data = data;

        /**
         * @type {ArrayBufferLike}
         */
        this.buffer = this.data.buffer;
    }
}