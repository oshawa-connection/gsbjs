
export type cv = {
    latitudeShift: number;
    longitudeShift: number;
    latitudeAccuracy: number;
    longitudeAccuracy: number;
    // Added by this library, not part of file format.
    latitudeOfCell: number;
    longitudeOfCell:number;
};

export type headerInfo = {
    nFields: number;//NUM_OREC
    nSubgridFields: number;//NUM_SREC
    nSubgrids: number;//NUM_FILE
    shiftType: string;//GS_TYPE
    // these aren't included 
    version: string;
    fromSystem: string;//SYSTEM_F
    toSystem:string;//SYSTEM_T
    // these aren't included 
    fromSemiMajorAxis: number;//MAJOR_F
    fromSemiMinorAxis: number;//MINOR_F
    toSemiMajorAxis: number;//MAJOR_T
    toSemiMinorAxis: number;//MINOR_T
};


export type gsbFileReadResult = {
    header: headerInfo;
    subgrids: {
        name:string;
        parent: string;
        // upperLongitude: number;
        // lowerLatitude: number; //S_LAT
        

        upperLongitude: number,//E_LONG
        lowerLongitude: number,//W_LONG
        upperLatitude: number,//N_LAT
        lowerLatitude: number,//S_LAT



        ll: any[];// upperLongitude and lowerLatitude packed into an array, ignore from now on.
        longitudeInterval: number;//LONG_INC
        latitudeInterval: number; //LAT_INC
        columnCount: number; 
        rowCount: number; // GS_COUNT
        lim: number[];
        count: number;
        cvs: Array<cv>;
        // these aren't included
        created: string; // CREATED
        updated: string; //UPDATED

    }[];
}