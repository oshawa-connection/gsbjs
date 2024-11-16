//@ts-check
import { readFileSync } from 'node:fs';
import { default as nadgrid } from './nadgrid.js';
import { Adapter } from './Adaptor.js';

const data = readFileSync('/home/james/Documents/gsbSplitter/data/OSTN15_NTv2_OSGBtoETRS.gsb');
const view = new Adapter(data);

const result = nadgrid("", view, false);

// console.log(result.header)
console.log(result.subgrids[0].cvs);


