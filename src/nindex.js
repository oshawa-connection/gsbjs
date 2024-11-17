//@ts-check
import fs from 'node:fs';
// import { readFileSync } from 'node:fs';
import { default as nadgrid } from './nadgrid.js';
import { Adapter } from './Adaptor.js';
import { GSBWriter, WriteableStream } from './GSBWriter.js';





const data = fs.readFileSync('/home/james/Documents/gsbSplitter/data/OSTN15_NTv2_OSGBtoETRS.gsb');
const view = new Adapter(data);
/**@type {import('../src/type').gsbFileReadResult} */
const result1 = nadgrid("", view, false);

const writer = new GSBWriter(result1);

const writeResult = writer.write();

fs.writeFileSync("./output/out.gsb", writeResult);


const data2 = fs.readFileSync('./output/out.gsb');
const view2 = new Adapter(data2);
/**@type {import('../src/type').gsbFileReadResult} */
const result2 = nadgrid("", view2, false);


console.log("HELLO");



// const data = fs.readFileSync('/home/james/Documents/gsbSplitter/data/OSTN15_NTv2_OSGBtoETRS.gsb');
// const view = new Adapter(data);

// /**@type {import('./type.ts').gsbFileReadResult} */
// const result = nadgrid("", view, false);

// // console.log(result.header)
// console.log(`${result.subgrids[0].lim}`);

// const arr = [1,2,3,4,5,6,7,8,9];
    


// /**
//  * @type {Array<import('./type.ts').cv>}
//  */
// const cast = result.subgrids[0].cvs;

// for(let i = 0; i < result.subgrids[0].rowCount; i++) {
//     for (let j = 0; j < result.subgrids[0].columnCount; j++) {
//         const index = i * result.subgrids[0].columnCount + j;
        
//         cast[index].longitudeOfCell = result.subgrids[0].ll[0] - (j * result.subgrids[0].longitudeInterval);
//         cast[index].latitudeOfCell = result.subgrids[0].ll[1] + (i * result.subgrids[0].latitudeInterval);
//     }
// }

// const row1 = new Uint8Array(16);
// Buffer.from("NUM_OREC")
// const y = Uint8Array.from("NUM_OREC".split('').map(letter => letter.charCodeAt(0)));

// y.forEach((d, i) => {
//     row1[i] = y[i];
// })


// const writer = new GSBWriter(result);

// const header = writer.write();

// fs.writeFileSync("/tmp/aaaa/ggg.gsb", header);