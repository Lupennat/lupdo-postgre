import { Pdo, ValidBindings } from 'lupdo';

import {
  isCrdb,
  isDigitPrecision,
  isRealPrecision,
  pdoData,
  supportArrayTime,
  supportPgSnapshot,
  supportTs,
} from '../fixtures/config';

describe('Postgres BigInt Cast', () => {
  it('Works Cast', async () => {
    const pdo = new Pdo(pdoData.driver, pdoData.config);

    let stmt = await pdo.query("SELECT CAST('9007199254740992' as BIGINT)");
    expect(stmt.fetchColumn(0).get()).toEqual(BigInt('9007199254740992'));

    stmt = await pdo.query("SELECT CAST('-9007199254740992' as BIGINT)");
    expect(stmt.fetchColumn(0).get()).toEqual(BigInt('-9007199254740992'));

    stmt = await pdo.query("SELECT CAST('9007199254740991' as BIGINT)");
    expect(stmt.fetchColumn(0).get()).toEqual(9007199254740991);

    stmt = await pdo.query("SELECT CAST('-9007199254740991' as BIGINT)");
    expect(stmt.fetchColumn(0).get()).toEqual(-9007199254740991);

    await pdo.disconnect();
  });

  it('Works All Columns Types', async () => {
    const pdo = new Pdo(pdoData.driver, pdoData.config);
    if (isCrdb()) {
      const stmt = await pdo.prepare(
        'INSERT INTO types (int8,bit,varbit,boolean,bytea,char,varchar,date,double_precision,inet,integer,interval,json,jsonb,decimal,numeric,real,smallint,text,time,timetz,timestamp,timestamptz,' +
          (supportTs() ? 'tsquery,tsvector,' : '') +
          'uuid)' +
          ' VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,' +
          (supportTs() ? '?,?,' : '') +
          '?)',
      );
      await stmt.execute(
        [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ].concat(supportTs() ? [null, null] : []),
      );

      await stmt.execute(
        [
          BigInt('-9223372036854775807'),
          '1',
          '101',
          1,
          Buffer.from('blob as text'),
          'c',
          'varchar',
          new Date('2014-01-01'),
          '0.1234567890123456789',
          '192.168.0.1/24',
          -2147483648,
          '1.5 years',
          '{"foo": {"bar": "baz"}}',
          '{"a": 1, "c": 0}',
          '12345.67890',
          '1234.566867670657880',
          '222221234.566860',
          2,
          'text',
          '23:59:00',
          '04:05:06+01',
          '2004-10-19 10:23:54',
          '2004-10-19 10:23:54+02',
        ].concat(
          supportTs()
            ? [
                "'fat' & ( 'rat' | 'cat' )",
                "'brown':3 'dog':9 'fox':4 'jump':5 'lazi':8 'quick':2",
                'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
              ]
            : ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'],
        ),
      );

      await stmt.close();

      const query = await pdo.query('SELECT * FROM types LIMIT 2;');

      let row = query.fetchDictionary().get() as {
        [key: string]: ValidBindings;
      };
      expect(row.int8).toBeNull();
      expect(row.bit).toBeNull();
      expect(row.varbit).toBeNull();
      expect(row.boolean).toBeNull();
      expect(row.bytea).toBeNull();
      expect(row.char).toBeNull();
      expect(row.varchar).toBeNull();
      expect(row.date).toBeNull();
      expect(row.double_precision).toBeNull();
      expect(row.inet).toBeNull();
      expect(row.integer).toBeNull();
      expect(row.interval).toBeNull();
      expect(row.json).toBeNull();
      expect(row.jsonb).toBeNull();
      expect(row.decimal).toBeNull();
      expect(row.numeric).toBeNull();
      expect(row.real).toBeNull();
      expect(row.smallint).toBeNull();
      expect(row.text).toBeNull();
      expect(row.time).toBeNull();
      expect(row.timetz).toBeNull();
      expect(row.timestamp).toBeNull();
      expect(row.timestamptz).toBeNull();
      if (supportTs()) {
        expect(row.tsquery).toBeNull();
        expect(row.tsvector).toBeNull();
      }
      expect(row.uuid).toBeNull();

      row = query.fetchDictionary().get() as { [key: string]: ValidBindings };
      expect(row.int8).toBe(BigInt('-9223372036854775807'));
      expect(row.bit).toBe('1');
      expect(row.varbit).toBe('101');
      expect(row.boolean).toBe(1);
      expect(row.bytea).toEqual(Buffer.from('blob as text'));
      expect(row.char).toBe('c');
      expect(row.varchar).toBe('varchar');
      expect(row.date).toBe('2014-01-01');
      expect(row.double_precision).toBe(
        isRealPrecision() ? '0.123456789012346' : '0.12345678901234568',
      );
      expect(row.inet).toBe('192.168.0.1/24');
      expect(row.integer).toBe(-2147483648);
      expect(row.interval).toBe('1 year 6 mons');
      expect(row.json).toBe('{"foo": {"bar": "baz"}}');
      expect(row.jsonb).toBe('{"a": 1, "c": 0}');
      expect(row.decimal).toBe('12345.67890');
      expect(row.numeric).toBe('1234.56687');
      expect(row.real).toBe(
        isRealPrecision() ? '222221234.56686' : '2.2222123e+08',
      );
      expect(row.smallint).toBe(2);
      expect(row.text).toBe('text');
      expect(row.time).toBe('23:59:00');
      expect(row.timetz).toBe('04:05:06+01');
      expect(row.timestamp).toBe('2004-10-19 10:23:54');
      expect(row.timestamptz).toBe('2004-10-19 08:23:54+00');
      if (supportTs()) {
        expect(row.tsquery).toBe("'fat' & ( 'rat' | 'cat' )");
        expect(row.tsvector).toBe(
          "'brown':3 'dog':9 'fox':4 'jump':5 'lazi':8 'quick':2",
        );
      }
      expect(row.uuid).toBe('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    } else {
      const stmt = await pdo.prepare(
        'INSERT INTO types (int8,bit,varbit,boolean,box,bytea,char,varchar,cidr,circle,date,double_precision,inet,integer,interval,json,jsonb,line,lseg,macaddr,macaddr8,money,decimal,numeric,path,pg_lsn,point,polygon,real,smallint,text,time,timetz,timestamp,timestamptz,tsquery,tsvector,txid_snapshot,uuid,xml' +
          (supportPgSnapshot() ? ',pg_snapshot' : '') +
          ')' +
          ' VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?' +
          (supportPgSnapshot() ? ',?' : '') +
          ');',
      );

      await stmt.execute(
        [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ].concat(supportPgSnapshot() ? [null] : []),
      );

      await stmt.execute(
        [
          BigInt('-9223372036854775807'),
          '1',
          '101',
          1,
          '((0,0),(1,1))',
          Buffer.from('blob as text'),
          'c',
          'varchar',
          '2001:db8:3333:4444:5555:6666:7777:8888',
          '((5,0),1)',
          new Date('2014-01-01'),
          '0.1234567890123456789',
          '192.168.0.1/24',
          -2147483648,
          '1.5 years',
          '{"foo": {"bar": "baz"}}',
          '{"a": 1, "c": 0}',
          '{1,2,-1}',
          '((-1,0),(1,0))',
          '08:00:2b:01:02:03',
          '08:00:2b:01:02:03:04:05',
          '-92233720368547758.08',
          '12345.67890',
          '1234.566867670657880',
          '((1,0),(0,1),(-1,0))',
          '7/A25801C8',
          '(2.0,0)',
          '((0,0),(1,1),(2,0))',
          '222221234.566860',
          2,
          'text',
          '23:59:00',
          '04:05:06 CET',
          '2004-10-19 10:23:54',
          '2004-10-19 10:23:54+02',
          "'fat' & ( 'rat' | 'cat' )",
          "'brown':3 'dog':9 'fox':4 'jump':5 'lazi':8 'quick':2",
          '5016429:5016429:',
          'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          '<?xml version="1.1"?><content>abc</content>',
        ].concat(supportPgSnapshot() ? ['5016429:5016429:'] : []),
      );

      await stmt.close();

      const query = await pdo.query('SELECT * FROM types LIMIT 2;');

      let row = query.fetchDictionary().get() as {
        [key: string]: ValidBindings;
      };
      expect(row.int8).toBeNull();
      expect(row.bit).toBeNull();
      expect(row.varbit).toBeNull();
      expect(row.boolean).toBeNull();
      expect(row.box).toBeNull();
      expect(row.bytea).toBeNull();
      expect(row.char).toBeNull();
      expect(row.varchar).toBeNull();
      expect(row.cidr).toBeNull();
      expect(row.circle).toBeNull();
      expect(row.date).toBeNull();
      expect(row.double_precision).toBeNull();
      expect(row.inet).toBeNull();
      expect(row.integer).toBeNull();
      expect(row.interval).toBeNull();
      expect(row.json).toBeNull();
      expect(row.jsonb).toBeNull();
      expect(row.line).toBeNull();
      expect(row.lseg).toBeNull();
      expect(row.macaddr).toBeNull();
      expect(row.macaddr8).toBeNull();
      expect(row.money).toBeNull();
      expect(row.decimal).toBeNull();
      expect(row.numeric).toBeNull();
      expect(row.path).toBeNull();
      expect(row.pg_lsn).toBeNull();
      expect(row.point).toBeNull();
      expect(row.polygon).toBeNull();
      expect(row.real).toBeNull();
      expect(row.smallint).toBeNull();
      expect(row.text).toBeNull();
      expect(row.time).toBeNull();
      expect(row.timetz).toBeNull();
      expect(row.timestamp).toBeNull();
      expect(row.timestamptz).toBeNull();
      expect(row.tsquery).toBeNull();
      expect(row.tsvector).toBeNull();
      expect(row.txid_snapshot).toBeNull();
      expect(row.uuid).toBeNull();
      expect(row.xml).toBeNull();
      if (supportPgSnapshot()) {
        expect(row.pg_snapshot).toBeNull();
      }

      row = query.fetchDictionary().get() as { [key: string]: ValidBindings };
      expect(row.int8).toBe(BigInt('-9223372036854775807'));
      expect(row.bit).toBe('1');
      expect(row.varbit).toBe('101');
      expect(row.boolean).toBe(1);
      expect(row.box).toBe('(1,1),(0,0)');
      expect(row.bytea).toEqual(Buffer.from('blob as text'));
      expect(row.char).toBe('c');
      expect(row.varchar).toBe('varchar');
      expect(row.cidr).toBe('2001:db8:3333:4444:5555:6666:7777:8888/128');
      expect(row.circle).toBe('<(5,0),1>');
      expect(row.date).toBe('2014-01-01');
      expect(row.double_precision).toBe(
        isDigitPrecision() ? '0.123456789012346' : '0.12345678901234568',
      );
      expect(row.inet).toBe('192.168.0.1/24');
      expect(row.integer).toBe(-2147483648);
      expect(row.interval).toBe('1 year 6 mons');
      expect(row.json).toBe('{"foo": {"bar": "baz"}}');
      expect(row.jsonb).toBe('{"a": 1, "c": 0}');
      expect(row.line).toBe('{1,2,-1}');
      expect(row.lseg).toBe('[(-1,0),(1,0)]');
      expect(row.macaddr).toBe('08:00:2b:01:02:03');
      expect(row.macaddr8).toBe('08:00:2b:01:02:03:04:05');
      expect(row.money).toBe('-$92,233,720,368,547,758.08');
      expect(row.decimal).toBe('12345.67890');
      expect(row.numeric).toBe('1234.56687');
      expect(row.path).toBe('((1,0),(0,1),(-1,0))');
      expect(row.pg_lsn).toBe('7/A25801C8');
      expect(row.point).toBe('(2,0)');
      expect(row.polygon).toBe('((0,0),(1,1),(2,0))');
      expect(row.real).toBe(
        isDigitPrecision() ? '2.22221e+08' : '2.2222123e+08',
      );
      expect(row.smallint).toBe(2);
      expect(row.text).toBe('text');
      expect(row.time).toBe('23:59:00');
      expect(row.timetz).toBe('04:05:06+01');
      expect(row.timestamp).toBe('2004-10-19 10:23:54');
      expect(row.timestamptz).toBe('2004-10-19 08:23:54+00');
      expect(row.tsquery).toBe("'fat' & ( 'rat' | 'cat' )");
      expect(row.tsvector).toBe(
        "'brown':3 'dog':9 'fox':4 'jump':5 'lazi':8 'quick':2",
      );
      expect(row.txid_snapshot).toBe('5016429:5016429:');
      expect(row.uuid).toBe('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
      expect(row.xml).toBe('<?xml version="1.1"?><content>abc</content>');
      if (supportPgSnapshot()) {
        expect(row.pg_snapshot).toBe('5016429:5016429:');
      }
    }
    await pdo.disconnect();
  });

  it('Works Array Types', async () => {
    const pdo = new Pdo(pdoData.driver, pdoData.config);
    if (isCrdb()) {
      const stmt = await pdo.prepare(
        'INSERT INTO types_array (int8,bit,varbit,boolean,bytea,char,varchar,date,double_precision,inet,integer,interval,decimal,numeric,real,smallint,text,time,timetz,timestamp,timestamptz,uuid)' +
          ' VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      );
      await stmt.execute([
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ]);

      await stmt.execute([
        [BigInt('-9223372036854775807'), BigInt('9223372036854775807')],
        ['1', '0'],
        ['101', '111'],
        [1, 0],
        [Buffer.from('blob as text'), Buffer.from('blob as text2')],
        ['c', 'd'],
        ['varchar', 'varchar2'],
        [new Date('2014-01-01'), new Date('2015-01-01')],
        ['1234567890123456789', '0.1234567890123456789'],
        ['192.168.0.1/24', '192.168.1.1/24'],
        [-2147483648, 2147483647],
        ['1.5 years', '1.2 years'],
        ['12345.67890', '98765.43210'],
        ['1234.566867670657880', '1234.966867670657880'],
        ['222221234.566860', '3.56686789'],
        [2, 3],
        ['text', 'text2'],
        ['23:59:00', '23:58:00'],
        ['04:05:06+01', '04:05:06-08'],
        ['2004-10-19 10:23:54', '2014-10-19 10:23:54'],
        ['2004-10-19 10:23:54+02', '2004-10-19 10:23:54 UTC'],
        [
          'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          'a0ee-bc99-9c0b-4ef8-bb6d-6bb9-bd38-0a11',
        ],
      ]);

      await stmt.close();

      const query = await pdo.query('SELECT * FROM types_array LIMIT 2;');

      let row = query.fetchDictionary().get() as {
        [key: string]: ValidBindings;
      };
      expect(row.int8).toBeNull();
      expect(row.bit).toBeNull();
      expect(row.varbit).toBeNull();
      expect(row.boolean).toBeNull();
      expect(row.bytea).toBeNull();
      expect(row.char).toBeNull();
      expect(row.varchar).toBeNull();
      expect(row.date).toBeNull();
      expect(row.double_precision).toBeNull();
      expect(row.inet).toBeNull();
      expect(row.integer).toBeNull();
      expect(row.interval).toBeNull();
      expect(row.decimal).toBeNull();
      expect(row.numeric).toBeNull();
      expect(row.real).toBeNull();
      expect(row.smallint).toBeNull();
      expect(row.text).toBeNull();
      expect(row.time).toBeNull();
      expect(row.timetz).toBeNull();
      expect(row.timestamp).toBeNull();
      expect(row.timestamptz).toBeNull();
      expect(row.uuid).toBeNull();

      row = query.fetchDictionary().get() as { [key: string]: ValidBindings };
      expect(row.int8).toEqual([
        BigInt('-9223372036854775807'),
        BigInt('9223372036854775807'),
      ]);
      expect(row.bit).toEqual(['1', '0']);
      expect(row.varbit).toEqual(['101', '111']);
      expect(row.boolean).toEqual([1, 0]);
      expect(row.bytea).toEqual([
        Buffer.from('blob as text'),
        Buffer.from('blob as text2'),
      ]);
      expect(row.char).toEqual(['c', 'd']);
      expect(row.varchar).toEqual(['varchar', 'varchar2']);
      expect(row.date).toEqual(['2014-01-01', '2015-01-01']);
      expect(row.double_precision).toEqual([
        '1.2345678901234568e+18',
        '0.12345678901234568',
      ]);
      expect(row.inet).toEqual(['192.168.0.1/24', '192.168.1.1/24']);
      expect(row.integer).toEqual([-2147483648, 2147483647]);
      expect(row.interval).toEqual(['1 year 6 mons', '1 year 2 mons']);
      expect(row.decimal).toEqual(['12345.67890', '98765.43210']);
      expect(row.numeric).toEqual(['1234.56687', '1234.96687']);
      expect(row.real).toEqual(
        isRealPrecision()
          ? ['2.2222123456686e+08', '3.56686789']
          : ['2.2222123e+08', '3.5668678'],
      );
      expect(row.smallint).toEqual([2, 3]);
      expect(row.text).toEqual(['text', 'text2']);
      expect(row.time).toEqual(['23:59:00', '23:58:00']);
      expect(row.timetz).toEqual(
        supportArrayTime()
          ? ['04:05:06+01', '04:05:06-08']
          : ['04:05:06+01:00:00', '04:05:06-08:00:00'],
      );
      expect(row.timestamp).toEqual([
        '2004-10-19 10:23:54',
        '2014-10-19 10:23:54',
      ]);
      expect(row.timestamptz).toEqual(
        supportArrayTime()
          ? ['2004-10-19 08:23:54+00', '2004-10-19 10:23:54+00']
          : ['2004-10-19 08:23:54+00:00', '2004-10-19 10:23:54+00:00'],
      );
      expect(row.uuid).toEqual([
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      ]);
    } else {
      const stmt = await pdo.prepare(
        'INSERT INTO types_array (int8,bit,varbit,boolean,box,bytea,char,varchar,cidr,circle,date,double_precision,inet,integer,interval,json,jsonb,line,lseg,macaddr,macaddr8,money,decimal,numeric,path,pg_lsn,point,polygon,real,smallint,text,time,timetz,timestamp,timestamptz,tsquery,tsvector,txid_snapshot,uuid,xml' +
          (supportPgSnapshot() ? ',pg_snapshot' : '') +
          ')' +
          ' VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?' +
          (supportPgSnapshot() ? ',?' : '') +
          ');',
      );

      await stmt.execute(
        [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ].concat(supportPgSnapshot() ? [null] : []),
      );

      await stmt.execute(
        [
          [BigInt('-9223372036854775807'), BigInt('9223372036854775807')],
          ['1', '0'],
          ['101', '111'],
          [1, 0],
          null,
          [Buffer.from('blob as text'), Buffer.from('blob as text2')],
          ['c', 'd'],
          ['varchar', 'varchar2'],
          [
            '2001:db8:3333:4444:5555:6666:7777:8888',
            '2002:db8:3333:4444:5555:6666:7777:8888',
          ],
          null,
          [new Date('2014-01-01'), new Date('2015-01-01')],
          ['1234567890123456789', '0.1234567890123456789'],
          ['192.168.0.1/24', '192.168.1.1/24'],
          [-2147483648, 2147483647],
          ['1.5 years', '1.2 years'],
          null,
          null,
          null,
          null,
          ['08:00:2b:01:02:03', '08:00:2b:01:02:04'],
          ['08:00:2b:01:02:03:04:05', '08:00:2b:01:02:03:04:06'],
          ['-92233720368547758.08', '92233720368547758.07'],
          ['12345.67890', '98765.43210'],
          ['1234.566867670657880', '1234.966867670657880'],
          null,
          ['7/A25801C8', '7/A25801C9'],
          null,
          null,
          ['222221234.566860', '3.56686789'],
          [2, 3],
          ['text', 'text2'],
          ['23:59:00', '23:58:00'],
          ['04:05:06 CET', '04:05:06 PST'],
          ['2004-10-19 10:23:54', '2014-10-19 10:23:54'],
          ['2004-10-19 10:23:54+02', '2004-10-19 10:23:54 UTC'],
          ["'fat' & ( 'rat' | 'cat' )", "'mat' & ( 'bat' | 'nat' )"],
          [
            "'brown':3 'dog':9 'fox':4 'jump':5 'lazi':8 'quick':2",
            "'brown':9 'dog':3 'fox':4 'jump':5 'lazi':2 'quick':8",
          ],
          ['5016429:5016429:', '5016428:5016428:'],
          [
            'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            'a0ee-bc99-9c0b-4ef8-bb6d-6bb9-bd38-0a11',
          ],
          [
            '<?xml version="1.1"?><content>abc</content>',
            '<?xml version="1.1"?><content>cde</content>',
          ],
        ].concat(
          supportPgSnapshot() ? [['5016429:5016429:', '5016428:5016428:']] : [],
        ),
      );
      await stmt.close();

      const query = await pdo.query('SELECT * FROM types_array LIMIT 2;');
      let row = query.fetchDictionary().get() as {
        [key: string]: ValidBindings;
      };
      expect(row.int8).toBeNull();
      expect(row.bit).toBeNull();
      expect(row.varbit).toBeNull();
      expect(row.boolean).toBeNull();
      expect(row.box).toBeNull();
      expect(row.bytea).toBeNull();
      expect(row.char).toBeNull();
      expect(row.varchar).toBeNull();
      expect(row.cidr).toBeNull();
      expect(row.circle).toBeNull();
      expect(row.date).toBeNull();
      expect(row.double_precision).toBeNull();
      expect(row.inet).toBeNull();
      expect(row.integer).toBeNull();
      expect(row.interval).toBeNull();
      expect(row.json).toBeNull();
      expect(row.jsonb).toBeNull();
      expect(row.line).toBeNull();
      expect(row.lseg).toBeNull();
      expect(row.macaddr).toBeNull();
      expect(row.macaddr8).toBeNull();
      expect(row.money).toBeNull();
      expect(row.decimal).toBeNull();
      expect(row.numeric).toBeNull();
      expect(row.path).toBeNull();
      expect(row.pg_lsn).toBeNull();
      expect(row.point).toBeNull();
      expect(row.polygon).toBeNull();
      expect(row.real).toBeNull();
      expect(row.smallint).toBeNull();
      expect(row.text).toBeNull();
      expect(row.time).toBeNull();
      expect(row.timetz).toBeNull();
      expect(row.timestamp).toBeNull();
      expect(row.timestamptz).toBeNull();
      expect(row.tsquery).toBeNull();
      expect(row.tsvector).toBeNull();
      expect(row.txid_snapshot).toBeNull();
      expect(row.uuid).toBeNull();
      expect(row.xml).toBeNull();
      if (supportPgSnapshot()) {
        expect(row.pg_snapshot).toBeNull();
      }

      row = query.fetchDictionary().get() as { [key: string]: ValidBindings };
      expect(row.int8).toEqual([
        BigInt('-9223372036854775807'),
        BigInt('9223372036854775807'),
      ]);
      expect(row.bit).toEqual(['1', '0']);
      expect(row.varbit).toEqual(['101', '111']);
      expect(row.boolean).toEqual([1, 0]);
      expect(row.box).toBeNull();
      expect(row.bytea).toEqual([
        Buffer.from('blob as text'),
        Buffer.from('blob as text2'),
      ]);
      expect(row.char).toEqual(['c', 'd']);
      expect(row.varchar).toEqual(['varchar', 'varchar2']);
      expect(row.cidr).toEqual([
        '2001:db8:3333:4444:5555:6666:7777:8888/128',
        '2002:db8:3333:4444:5555:6666:7777:8888/128',
      ]);
      expect(row.circle).toBeNull();
      expect(row.date).toEqual(['2014-01-01', '2015-01-01']);
      expect(row.double_precision).toEqual(
        isDigitPrecision()
          ? ['1.23456789012346e+18', '0.123456789012346']
          : ['1.2345678901234568e+18', '0.12345678901234568'],
      );
      expect(row.inet).toEqual(['192.168.0.1/24', '192.168.1.1/24']);
      expect(row.integer).toEqual([-2147483648, 2147483647]);
      expect(row.interval).toEqual(['1 year 6 mons', '1 year 2 mons']);
      expect(row.json).toBeNull();
      expect(row.jsonb).toBeNull();
      expect(row.line).toBeNull();
      expect(row.lseg).toBeNull();
      expect(row.macaddr).toEqual(['08:00:2b:01:02:03', '08:00:2b:01:02:04']);
      expect(row.macaddr8).toEqual([
        '08:00:2b:01:02:03:04:05',
        '08:00:2b:01:02:03:04:06',
      ]);
      expect(row.money).toEqual([
        '-$92,233,720,368,547,758.08',
        '$92,233,720,368,547,758.07',
      ]);
      expect(row.decimal).toEqual(['12345.67890', '98765.43210']);
      expect(row.numeric).toEqual(['1234.56687', '1234.96687']);
      expect(row.path).toBeNull();
      expect(row.pg_lsn).toEqual(['7/A25801C8', '7/A25801C9']);
      expect(row.point).toBeNull();
      expect(row.polygon).toBeNull();
      expect(row.real).toEqual(
        isDigitPrecision()
          ? ['2.22221e+08', '3.56687']
          : ['2.2222123e+08', '3.5668678'],
      );
      expect(row.smallint).toEqual([2, 3]);
      expect(row.text).toEqual(['text', 'text2']);
      expect(row.time).toEqual(['23:59:00', '23:58:00']);
      expect(row.timetz).toEqual(['04:05:06+01', '04:05:06-08']);
      expect(row.timestamp).toEqual([
        '2004-10-19 10:23:54',
        '2014-10-19 10:23:54',
      ]);
      expect(row.timestamptz).toEqual([
        '2004-10-19 08:23:54+00',
        '2004-10-19 10:23:54+00',
      ]);
      expect(row.tsquery).toEqual([
        "'fat' & ( 'rat' | 'cat' )",
        "'mat' & ( 'bat' | 'nat' )",
      ]);
      expect(row.tsvector).toEqual([
        "'brown':3 'dog':9 'fox':4 'jump':5 'lazi':8 'quick':2",
        "'brown':9 'dog':3 'fox':4 'jump':5 'lazi':2 'quick':8",
      ]);
      expect(row.txid_snapshot).toEqual([
        '5016429:5016429:',
        '5016428:5016428:',
      ]);
      expect(row.uuid).toEqual([
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      ]);
      expect(row.xml).toEqual([
        '<?xml version="1.1"?><content>abc</content>',
        '<?xml version="1.1"?><content>cde</content>',
      ]);

      if (supportPgSnapshot()) {
        expect(row.pg_snapshot).toEqual([
          '5016429:5016429:',
          '5016428:5016428:',
        ]);
      }
    }

    await pdo.disconnect();
  });

  it('Works Geo Types', async () => {
    const pdo = new Pdo(pdoData.driver, pdoData.config);
    const stmt = await pdo.prepare(
      'INSERT INTO geo_types (point,linestring,polygon,multipoint,multilinestring,multipolygon,geometrycollection,geo_point,geo_linestring,geo_polygon,geo_multipoint,geo_multilinestring,geo_multipolygon,geo_geometrycollection)' +
        ' VALUES (ST_GeomFromText(?),ST_GeomFromText(?),ST_GeomFromText(?),ST_GeomFromText(?),ST_GeomFromText(?),ST_GeomFromText(?),ST_GeomFromText(?),ST_GeogFromText(?),ST_GeogFromText(?),ST_GeogFromText(?),ST_GeogFromText(?),ST_GeogFromText(?),ST_GeogFromText(?),ST_GeogFromText(?));',
    );

    await stmt.execute([
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ]);

    await stmt.execute([
      'POINT(1 1)',
      'LINESTRING(0 0,1 1,2 2)',
      'POLYGON((0 0,10 0,10 10,0 10,0 0),(5 5,7 5,7 7,5 7, 5 5))',
      'MULTIPOINT(0 0, 20 20, 60 60)',
      'MULTILINESTRING((10 10, 20 20), (15 15, 30 15))',
      'MULTIPOLYGON(((0 0,10 0,10 10,0 10,0 0)),((5 5,7 5,7 7,5 7, 5 5)))',
      'GEOMETRYCOLLECTION(POINT(1 1),LINESTRING(0 0,1 1,2 2,3 3,4 4))',
      'POINT(1 1)',
      'LINESTRING(0 0,1 1,2 2)',
      'POLYGON((0 0,10 0,10 10,0 10,0 0),(5 5,7 5,7 7,5 7, 5 5))',
      'MULTIPOINT(0 0, 20 20, 60 60)',
      'MULTILINESTRING((10 10, 20 20), (15 15, 30 15))',
      'MULTIPOLYGON(((0 0,10 0,10 10,0 10,0 0)),((5 5,7 5,7 7,5 7, 5 5)))',
      'GEOMETRYCOLLECTION(POINT(1 1),LINESTRING(0 0,1 1,2 2,3 3,4 4))',
    ]);

    await stmt.close();

    const query = await pdo.query(
      'SELECT ST_AsText(point) as point,ST_AsText(linestring) as linestring,ST_AsText(polygon) as polygon,ST_AsText(multipoint) as multipoint,ST_AsText(multilinestring) as multilinestring,ST_AsText(multipolygon) as multipolygon,ST_AsText(geometrycollection) as geometrycollection,ST_AsText(geo_point) as geo_point,ST_AsText(geo_linestring) as geo_linestring,ST_AsText(geo_polygon) as geo_polygon,ST_AsText(geo_multipoint) as geo_multipoint,ST_AsText(geo_multilinestring) as geo_multilinestring,ST_AsText(geo_multipolygon) as geo_multipolygon,ST_AsText(geo_geometrycollection) as geo_geometrycollection FROM geo_types LIMIT 2;',
    );

    let row = query.fetchDictionary().get() as { [key: string]: ValidBindings };
    expect(row.point).toBeNull();
    expect(row.linestring).toBeNull();
    expect(row.polygon).toBeNull();
    expect(row.multipoint).toBeNull();
    expect(row.multilinestring).toBeNull();
    expect(row.multipolygon).toBeNull();
    expect(row.geometrycollection).toBeNull();
    expect(row.geo_point).toBeNull();
    expect(row.geo_linestring).toBeNull();
    expect(row.geo_polygon).toBeNull();
    expect(row.geo_multipoint).toBeNull();
    expect(row.geo_multilinestring).toBeNull();
    expect(row.geo_multipolygon).toBeNull();
    expect(row.geo_geometrycollection).toBeNull();
    row = query.fetchDictionary().get() as { [key: string]: ValidBindings };
    if (isCrdb()) {
      expect(row.point).toBe('POINT (1 1)');
      expect(row.linestring).toBe('LINESTRING (0 0, 1 1, 2 2)');
      expect(row.polygon).toBe(
        'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0), (5 5, 7 5, 7 7, 5 7, 5 5))',
      );
      expect(row.multipoint).toBe('MULTIPOINT (0 0, 20 20, 60 60)');
      expect(row.multilinestring).toBe(
        'MULTILINESTRING ((10 10, 20 20), (15 15, 30 15))',
      );
      expect(row.multipolygon).toBe(
        'MULTIPOLYGON (((0 0, 10 0, 10 10, 0 10, 0 0)), ((5 5, 7 5, 7 7, 5 7, 5 5)))',
      );
      expect(row.geometrycollection).toBe(
        'GEOMETRYCOLLECTION (POINT (1 1), LINESTRING (0 0, 1 1, 2 2, 3 3, 4 4))',
      );
      expect(row.geo_point).toBe('POINT (1 1)');
      expect(row.geo_linestring).toBe('LINESTRING (0 0, 1 1, 2 2)');
      expect(row.geo_polygon).toBe(
        'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0), (5 5, 7 5, 7 7, 5 7, 5 5))',
      );
      expect(row.geo_multipoint).toBe('MULTIPOINT (0 0, 20 20, 60 60)');
      expect(row.geo_multilinestring).toBe(
        'MULTILINESTRING ((10 10, 20 20), (15 15, 30 15))',
      );
      expect(row.geo_multipolygon).toBe(
        'MULTIPOLYGON (((0 0, 10 0, 10 10, 0 10, 0 0)), ((5 5, 7 5, 7 7, 5 7, 5 5)))',
      );
      expect(row.geo_geometrycollection).toBe(
        'GEOMETRYCOLLECTION (POINT (1 1), LINESTRING (0 0, 1 1, 2 2, 3 3, 4 4))',
      );
    } else {
      expect(row.point).toBe('POINT(1 1)');
      expect(row.linestring).toBe('LINESTRING(0 0,1 1,2 2)');
      expect(row.polygon).toBe(
        'POLYGON((0 0,10 0,10 10,0 10,0 0),(5 5,7 5,7 7,5 7,5 5))',
      );
      expect(row.multipoint).toBe('MULTIPOINT((0 0),(20 20),(60 60))');
      expect(row.multilinestring).toBe(
        'MULTILINESTRING((10 10,20 20),(15 15,30 15))',
      );
      expect(row.multipolygon).toBe(
        'MULTIPOLYGON(((0 0,10 0,10 10,0 10,0 0)),((5 5,7 5,7 7,5 7,5 5)))',
      );
      expect(row.geometrycollection).toBe(
        'GEOMETRYCOLLECTION(POINT(1 1),LINESTRING(0 0,1 1,2 2,3 3,4 4))',
      );
      expect(row.geo_point).toBe('POINT(1 1)');
      expect(row.geo_linestring).toBe('LINESTRING(0 0,1 1,2 2)');
      expect(row.geo_polygon).toBe(
        'POLYGON((0 0,10 0,10 10,0 10,0 0),(5 5,7 5,7 7,5 7,5 5))',
      );
      expect(row.geo_multipoint).toBe('MULTIPOINT((0 0),(20 20),(60 60))');
      expect(row.geo_multilinestring).toBe(
        'MULTILINESTRING((10 10,20 20),(15 15,30 15))',
      );
      expect(row.geo_multipolygon).toBe(
        'MULTIPOLYGON(((0 0,10 0,10 10,0 10,0 0)),((5 5,7 5,7 7,5 7,5 5)))',
      );
      expect(row.geo_geometrycollection).toBe(
        'GEOMETRYCOLLECTION(POINT(1 1),LINESTRING(0 0,1 1,2 2,3 3,4 4))',
      );
    }
    await pdo.disconnect();
  });
});
