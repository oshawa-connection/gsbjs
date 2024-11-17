//@ts-check


const BYTES_PER_ROW = {
    HEADER: 16, // 8 for the key, 8 for the value,
}


export class GSBWriter {
    /**
     * 
     * @param {import("./type").gsbFileReadResult} gsbFileReadResult 
     */
    constructor(gsbFileReadResult) {
        this.gsbFileReadResult = gsbFileReadResult;
    }

    writeHeaderOnly() {
        
        const headerSize = this.gsbFileReadResult.header.nFields * BYTES_PER_ROW.HEADER


        const subGridsSize = this.gsbFileReadResult.header.nSubgridFields * BYTES_PER_ROW.HEADER * this.gsbFileReadResult.subgrids.length;

        const stream = new WriteableStream(headerSize + subGridsSize, true);
        stream.writeString("NUM_OREC", true);
        stream.writeInt32(this.gsbFileReadResult.header.nFields);
        
        
        stream.writeString("NUM_SREC", true);
        stream.writeInt32(this.gsbFileReadResult.header.nSubgridFields);
        
        stream.writeString("NUM_FILE", true);
        stream.writeInt32(this.gsbFileReadResult.header.nSubgrids);
        
        
        stream.writeString("GS_TYPE", true);
        stream.writeString(this.gsbFileReadResult.header.shiftType);


        
        stream.writeString("VERSION", true);
        if (this.gsbFileReadResult.header.version === undefined) {
            stream.writeString("gsbjs");
        } else {
            stream.writeString(this.gsbFileReadResult.header.version);
        }
        

        stream.writeString("SYSTEM_F", true);
        if (this.gsbFileReadResult.header.fromSystem === undefined) {
            stream.writeString("AIRY1830");
        } else {
            stream.writeString(this.gsbFileReadResult.header.fromSystem);
        }

        stream.writeString("SYSTEM_T", true);
        if (this.gsbFileReadResult.header.toSystem === undefined) {
            stream.writeString("GRS80");
        } else {
            stream.writeString(this.gsbFileReadResult.header.toSystem);
        }

        stream.writeString("MAJOR_F", true);
        stream.writeFloat64(this.gsbFileReadResult.header.fromSemiMajorAxis);


        stream.writeString("MINOR_F", true);
        stream.writeFloat64(this.gsbFileReadResult.header.fromSemiMinorAxis);

        stream.writeString("MAJOR_T", true);
        stream.writeFloat64(this.gsbFileReadResult.header.toSemiMajorAxis);

        stream.writeString("MINOR_T", true);
        stream.writeFloat64(this.gsbFileReadResult.header.toSemiMinorAxis);

        // begin subgrids
        this.gsbFileReadResult.subgrids.forEach(subGrid => {

            stream.writeString("SUB_NAME", true);
            stream.writeString(subGrid.name);

            stream.writeString("PARENT", true);
            stream.writeString(subGrid.parent);

            stream.writeString("CREATED", true);
            stream.writeString("20161003");

            stream.writeString("UPDATED", true);
            stream.writeString("20161003");

            stream.writeString("S_LAT", true);
            stream.writeFloat64(subGrid.lowerLatitude);

            stream.writeString("N_LAT", true);
            stream.writeFloat64(subGrid.upperLatitude);

            stream.writeString("E_LONG", true);
            stream.writeFloat64(subGrid.upperLongitude);
            

            stream.writeString("W_LONG", true);
            stream.writeFloat64(subGrid.lowerLongitude);
            

            stream.writeString("LAT_INC", true);
            stream.writeFloat64(subGrid.latitudeInterval);

            stream.writeString("LONG_INC", true);
            stream.writeFloat64(subGrid.longitudeInterval);


            stream.writeString("GS_COUNT", true);
            stream.writeInt32(subGrid.count);

        });


        return new Uint8Array(stream.backing);
    }

    write() {

    }
}


export class WriteableStream {
    /**
     * 
     * @param {*} sizeInBytes
     * @param {boolean} isLittleEndian 
     */
    constructor(sizeInBytes, isLittleEndian) {
        this.backing = new ArrayBuffer(sizeInBytes);
        this.dataView = new DataView(this.backing);
        this.isLittleEndian = isLittleEndian;
        this.textEncoder = new TextEncoder();
        this.currentBytePosition = 0
    }

    /**
     * @param {Uint8Array} array 
     */
    writeArrayToDataView(array) {
        array.forEach(d => {
            this.dataView.setInt8(this.currentBytePosition, d);
            this.currentBytePosition +=1;
        })
        
    }

    /**
     * 
     * @param {string} str 
     * @param {boolean} isheaderKey 
     */
    writeString(str, isheaderKey = false) {
        const padded = new Uint8Array(8); // pad with null bytes

        // header rows are a mess in this format, sometimes have padding with spaces, other times with null bytes, or even carriage return characters
        // all these within the SAME FILE.
        // I think this is probably of quirk of the old software ordnance survey are using to write this file format.
        if (isheaderKey === true) {
            padded.fill(" ".charCodeAt(0));
        }
        
        if (str.length > 8) {
            throw new Error(`Cannot write string ${str} as it must be 8 characters or less`);
        }
        str.split("").forEach((char, index) => {
            padded[index] = char.charCodeAt(0);
        });

        this.writeArrayToDataView(padded);
    }

    /**
     * 
     * @param {number} value 
     */
    writeFloat64(value) {
        this.dataView.setFloat64(this.currentBytePosition, value, this.isLittleEndian);
        this.currentBytePosition += 8;
    }

    /**
     * 
     * @param {number} value 
     */
    writeInt32(value) {
        this.dataView.setInt32(this.currentBytePosition, value, this.isLittleEndian);
        // Even though 32 bit integer takes up only 4 bytes, need to advance 8 bytes leaving 4 bytes as null.
        this.currentBytePosition += 8;
    }
}