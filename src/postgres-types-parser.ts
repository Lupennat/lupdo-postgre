/* eslint-disable @typescript-eslint/no-var-requires */
import { CustomTypesConfig } from 'pg';

import {
  getTypeParser,
  parseArrayBigint,
  parseArrayBoolean,
  parseArrayString,
  parseBigint,
  parseBoolean,
  parseString,
  setTypeParser,
  typeParsers,
} from './utils';

const textParsers = require('pg-types/lib/textParsers');
const binaryParsers = require('pg-types/lib/binaryParsers');

textParsers.init(function (oid: number, converter: Function): void {
  typeParsers.text[oid] = converter;
});

binaryParsers.init(function (oid: number, converter: Function): void {
  typeParsers.binary[oid] = converter;
});

setTypeParser(20, parseBigint); // int8
setTypeParser(1016, parseArrayBigint); // int8 array
setTypeParser(700, parseString); // float/4
setTypeParser(1021, parseArrayString); // float/4 array
setTypeParser(701, parseString); // float8/double
setTypeParser(1022, parseArrayString); // float8/double array
setTypeParser(16, parseBoolean); // boolean
setTypeParser(1000, parseArrayBoolean); // boolean array
setTypeParser(1700, parseString); // decimal
setTypeParser(1231, parseArrayString); // decimal array

setTypeParser(600, parseString); // point
setTypeParser(1017, parseArrayString); // point array
setTypeParser(1020, parseArrayString); // box array
setTypeParser(1018, parseString); // lseg array
setTypeParser(1019, parseString); // path array
setTypeParser(1027, parseString); // poligon array
setTypeParser(718, parseString); // circle
setTypeParser(719, parseArrayString); // circle array

setTypeParser(114, parseString); // json
setTypeParser(199, parseArrayString); // json array
setTypeParser(3802, parseString); // jsonb
setTypeParser(3807, parseArrayString); // jsonb array

setTypeParser(1186, parseString); // interval
setTypeParser(1187, parseArrayString); // interval array

setTypeParser(1082, parseString); // date
setTypeParser(1182, parseArrayString); // date array
setTypeParser(1114, parseString); // timestamp without timezone
setTypeParser(1115, parseArrayString); // timestamp without time zone array
setTypeParser(1184, parseString); // timestamp with time zone
setTypeParser(1185, parseArrayString); // timestamp with time zone array

setTypeParser(1561, parseArrayString); // bit array
setTypeParser(1563, parseArrayString); // varbit array

setTypeParser(775, parseArrayString); // macaddr8 array

setTypeParser(3221, parseArrayString); // pg_lsn array
setTypeParser(3645, parseArrayString); // tsquery array
setTypeParser(3643, parseArrayString); // tsvector array
setTypeParser(2949, parseArrayString); // txid_snapshot array
setTypeParser(5039, parseArrayString); // pg_snapshot array
setTypeParser(143, parseArrayString); // xml array

export default {
  getTypeParser,
} as CustomTypesConfig;
