//@ts-check
/**
 * Taken and modified from https://github.com/proj4js/proj4js/ with licence https://github.com/proj4js/proj4js/blob/master/LICENSE.md
 * 
 * Resources for details of NTv2 file formats:
 * - https://web.archive.org/web/20140127204822if_/http://www.mgs.gov.on.ca:80/stdprodconsume/groups/content/@mgs/@iandit/documents/resourcelist/stel02_047447.pdf
 * - http://mimaka.com/help/gs/html/004_NTV2%20Data%20Format.htm
 */

var loadedNadgrids = {};

/**
 * Load a binary NTv2 file (.gsb) to a key that can be used in a proj string like +nadgrids=<key>. Pass the NTv2 file
 * as an ArrayBuffer.
 */
export default function nadgrid(key, view, convertToRadians) {
  // var view = new DataView(data);
  var isLittleEndian = detectLittleEndian(view);
  var header = readHeader(view, isLittleEndian);
  var subgrids = readSubgrids(view, header, isLittleEndian, convertToRadians);
  var nadgrid = {header: header, subgrids: subgrids};
  loadedNadgrids[key] = nadgrid;
  return nadgrid;
}

/**
 * Given a proj4 value for nadgrids, return an array of loaded grids
 */
export function getNadgrids(nadgrids) {
  // Format details: http://proj.maptools.org/gen_parms.html
  if (nadgrids === undefined) { return null; }
  var grids = nadgrids.split(',');
  return grids.map(parseNadgridString);
}

function parseNadgridString(value) {
  if (value.length === 0) {
    return null;
  }
  var optional = value[0] === '@';
  if (optional) {
    value = value.slice(1);
  }
  if (value === 'null') {
    return {name: 'null', mandatory: !optional, grid: null, isNull: true};
  }
  return {
    name: value,
    mandatory: !optional,
    grid: loadedNadgrids[value] || null,
    isNull: false
  };
}

function secondsToRadiansFp(seconds) {
  return (seconds / 3600) * Math.PI / 180;
}

function detectLittleEndian(view) {
  var nFields = view.getInt32(8, false);
  if (nFields === 11) {
    return false;
  }
  nFields = view.getInt32(8, true);
  if (nFields !== 11) {
    console.warn('Failed to detect nadgrid endian-ness, defaulting to little-endian');
  }
  return true;
}

function readHeader(view, isLittleEndian) {
  return {
    nFields: view.getInt32(8, isLittleEndian),
    nSubgridFields: view.getInt32(24, isLittleEndian),
    nSubgrids: view.getInt32(40, isLittleEndian),
    shiftType: decodeString(view, 56, 56 + 8).trim(),
    fromSemiMajorAxis: view.getFloat64(120, isLittleEndian),
    fromSemiMinorAxis: view.getFloat64(136, isLittleEndian),
    toSemiMajorAxis: view.getFloat64(152, isLittleEndian),
    toSemiMinorAxis: view.getFloat64(168, isLittleEndian),
  };
}

function decodeString(view, start, end) {
  return String.fromCharCode.apply(null, new Uint8Array(view.buffer.slice(start, end)));
}

function readSubgrids(view, header, isLittleEndian, convertToRadians) {
  var gridOffset = 176;
  var grids = [];
  for (var i = 0; i < header.nSubgrids; i++) {
    var subHeader = readGridHeader(view, gridOffset, isLittleEndian);
    var nodes = readGridNodes(view, gridOffset, subHeader, isLittleEndian);
    var lngColumnCount = Math.round(
      1 + (subHeader.upperLongitude - subHeader.lowerLongitude) / subHeader.longitudeInterval);
    var latColumnCount = Math.round(
      1 + (subHeader.upperLatitude - subHeader.lowerLatitude) / subHeader.latitudeInterval);

    var secondsToRadians = (d) => d;
    if (convertToRadians) {
      secondsToRadians = secondsToRadiansFp;
    }
    

    // Proj4 operates on radians whereas the coordinates are in seconds in the grid
    grids.push({
      name: subHeader.name,
      parent: subHeader.parent,
      upperLongitude:subHeader.upperLongitude,
      lowerLongitude: subHeader.lowerLongitude,
      upperLatitude:subHeader.upperLatitude,
      lowerLatitude: subHeader.lowerLatitude,
      ll: [secondsToRadians(subHeader.upperLongitude), secondsToRadians(subHeader.lowerLatitude)],
      longitudeInterval: subHeader.longitudeInterval,
      latitudeInterval: subHeader.latitudeInterval,
      // del: [secondsToRadians(subHeader.longitudeInterval), secondsToRadians(subHeader.latitudeInterval)],
      columnCount:lngColumnCount,
      rowCount:latColumnCount,
      lim: [lngColumnCount, latColumnCount],
      count: subHeader.gridNodeCount,
      cvs: mapNodes(nodes, convertToRadians)
    });
    gridOffset += 176 + subHeader.gridNodeCount * 16;
  }
  return grids;
}

function mapNodes(nodes, convertToRadians) {

  var secondsToRadians = (d) => d;
  if (convertToRadians) {
    secondsToRadians = secondsToRadiansFp;
  }

  return nodes.map(function (r) {
    return r;
    // return [secondsToRadians(r.latitudeShift), secondsToRadians(r.longitudeShift), r.latitudeAccuracy, r.longitudeAccuracy];
  });
}

function readGridHeader(view, offset, isLittleEndian) {
  return {
    name: decodeString(view, offset + 8, offset + 16).trim(),
    parent: decodeString(view, offset + 24, offset + 24 + 8).trim(),
    lowerLatitude: view.getFloat64(offset + 72, isLittleEndian),
    upperLatitude: view.getFloat64(offset + 88, isLittleEndian),
    lowerLongitude: view.getFloat64(offset + 104, isLittleEndian),
    upperLongitude: view.getFloat64(offset + 120, isLittleEndian),
    latitudeInterval: view.getFloat64(offset + 136, isLittleEndian),
    longitudeInterval: view.getFloat64(offset + 152, isLittleEndian),
    gridNodeCount: view.getInt32(offset + 168, isLittleEndian)
  };
}
/**
 * 
 * @param {DataView} view 
 * @param {*} offset 
 * @param {*} gridHeader 
 * @param {*} isLittleEndian 
 * @returns 
 */
function readGridNodes(view, offset, gridHeader, isLittleEndian) {
  var nodesOffset = offset + 176;
  var gridRecordLength = 16;
  var gridShiftRecords = [];
  for (var i = 0; i < gridHeader.gridNodeCount; i++) {
    var record = {
      latitudeShift: view.getFloat32(nodesOffset + i * gridRecordLength, isLittleEndian),
      longitudeShift: view.getFloat32(nodesOffset + i * gridRecordLength + 4, isLittleEndian),
      latitudeAccuracy: view.getFloat32(nodesOffset + i * gridRecordLength + 8, isLittleEndian),
      longitudeAccuracy: view.getFloat32(nodesOffset + i * gridRecordLength + 12, isLittleEndian),
    };
    gridShiftRecords.push(record);
  }
  return gridShiftRecords;
}