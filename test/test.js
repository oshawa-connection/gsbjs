//@ts-check
import fs from 'node:fs';
import { equal, deepEqual } from 'assert';
import { Adapter } from '../src/Adaptor.js';
import { GSBWriter } from '../src/GSBWriter.js';
import nadgrid from '../src/nadgrid.js';


describe('GSBWriter', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
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


        equal(result1.subgrids[0].latitudeInterval,  result2.subgrids[0].latitudeInterval);
        equal(result1.subgrids[0].longitudeInterval,  result2.subgrids[0].longitudeInterval);
        equal(result1.subgrids[0].count,  result2.subgrids[0].count);
        equal(result1.subgrids[0].columnCount,  result2.subgrids[0].columnCount, "column count");
        equal(result1.subgrids[0].rowCount,  result2.subgrids[0].rowCount, "row count");
        deepEqual(result2, result1);
        

    });
  });
});


