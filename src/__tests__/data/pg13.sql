DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS types;
DROP TABLE IF EXISTS types_array;
DROP SEQUENCE IF EXISTS test_db_users_id_seq;
DROP SEQUENCE IF EXISTS test_db_companies_id_seq;
DROP SEQUENCE IF EXISTS test_db_users_id_seq;
DROP SEQUENCE IF EXISTS types_serial_seq;
DROP SEQUENCE IF EXISTS types_smallserial_seq;
DROP SEQUENCE IF EXISTS types_bigserial_seq;
DROP SEQUENCE IF EXISTS types_array_serial_seq;
DROP SEQUENCE IF EXISTS types_array_smallserial_seq;
DROP SEQUENCE IF EXISTS types_array_bigserial_seq;
CREATE SEQUENCE test_db_users_id_seq;
CREATE TABLE users (id BIGINT NOT NULL DEFAULT nextval('test_db_users_id_seq'),name VARCHAR(255) NOT NULL,gender VARCHAR(255) NOT NULL,PRIMARY KEY (id));
ALTER SEQUENCE test_db_users_id_seq OWNED BY users.id;
CREATE SEQUENCE test_db_companies_id_seq;
CREATE TABLE companies (id INT NOT NULL DEFAULT nextval('test_db_companies_id_seq'),name VARCHAR(255) NULL,opened TIMESTAMP NOT NULL, active SMALLINT NOT NULL, "binary" BYTEA NULL, PRIMARY KEY (id));
ALTER SEQUENCE test_db_companies_id_seq OWNED BY companies.id;
CREATE TABLE types (
    "serial" serial,
    "smallserial" smallserial,
    "bigserial" bigserial,
    "int8" int8 NULL,
    "bit" bit NULL,
    "varbit" varbit NULL,
    "boolean" boolean NULL,
    "box" box NULL,
    "bytea" bytea NULL,
    "char" char NULL,
    "varchar" varchar NULL,
    "cidr" cidr NULL,
    "circle" circle NULL,
    "date" date NULL,
    "double_precision" double precision NULL,
    "inet" inet NULL,
    "integer" integer NULL,
    "interval" interval NULL,
    "json" json NULL,
    "jsonb" jsonb NULL,
    "line" line NULL,
    "lseg" lseg NULL,
    "macaddr" macaddr NULL,
    "macaddr8" macaddr8 NULL,
    "money" money NULL,
    "decimal" decimal(10,5) NULL,
    "numeric" numeric(10,5) NULL,
    "path" path NULL,
    "pg_lsn" pg_lsn NULL,
    "pg_snapshot" pg_snapshot NULL,
    "point" point NULL,
    "polygon" polygon NULL,
    "real" real NULL,
    "smallint" smallint NULL,
    "text" text NULL,
    "time" time NULL,
    "timetz" timetz NULL,
    "timestamp" timestamp NULL,
    "timestamptz" timestamptz NULL,
    "tsquery" tsquery NULL,
    "tsvector" tsvector NULL,
    "txid_snapshot" txid_snapshot NULL,
    "uuid" uuid NULL,
    "xml" xml NULL
);
CREATE TABLE types_array (
    "serial" serial,
    "smallserial" smallserial,
    "bigserial" bigserial,
    "int8" int8[] NULL,
    "bit" bit[] NULL,
    "varbit" varbit[] NULL,
    "boolean" boolean[] NULL,
    "box" box[] NULL,
    "bytea" bytea[] NULL,
    "char" char[] NULL,
    "varchar" varchar[] NULL,
    "cidr" cidr[] NULL,
    "circle" circle[] NULL,
    "date" date[] NULL,
    "double_precision" double precision[] NULL,
    "inet" inet[] NULL,
    "integer" integer[] NULL,
    "interval" interval[] NULL,
    "json" json[] NULL,
    "jsonb" jsonb[] NULL,
    "line" line[] NULL,
    "lseg" lseg[] NULL,
    "macaddr" macaddr[] NULL,
    "macaddr8" macaddr8[] NULL,
    "money" money[] NULL,
    "decimal" decimal(10,5)[] NULL,
    "numeric" numeric(10,5)[] NULL,
    "path" path[] NULL,
    "pg_lsn" pg_lsn[] NULL,
    "pg_snapshot" pg_snapshot[] NULL,
    "point" point[] NULL,
    "polygon" polygon[] NULL,
    "real" real[] NULL,
    "smallint" smallint[] NULL,
    "text" text[] NULL,
    "time" time[] NULL,
    "timetz" timetz[] NULL,
    "timestamp" timestamp[] NULL,
    "timestamptz" timestamptz[] NULL,
    "tsquery" tsquery[] NULL,
    "tsvector" tsvector[] NULL,
    "txid_snapshot" txid_snapshot[] NULL,
    "uuid" uuid[] NULL,
    "xml" xml[] NULL
);
INSERT INTO users (name, gender) VALUES ('Edmund','Multigender');
INSERT INTO users (name, gender) VALUES ('Kyleigh','Cis man');
INSERT INTO users (name, gender) VALUES ('Josefa','Cisgender male');
INSERT INTO users (name, gender) VALUES ('Cecile','Agender');
INSERT INTO users (name, gender) VALUES ('Sincere','Demi-girl');
INSERT INTO users (name, gender) VALUES ('Baron','Cisgender male');
INSERT INTO users (name, gender) VALUES ('Mckayla','Genderflux');
INSERT INTO users (name, gender) VALUES ('Wellington','Cisgender woman');
INSERT INTO users (name, gender) VALUES ('Tod','Demi-man');
INSERT INTO users (name, gender) VALUES ('Jeffrey','Androgyne');
INSERT INTO users (name, gender) VALUES ('Keenan','Two-spirit person');
INSERT INTO users (name, gender) VALUES ('Lucile','Man');
INSERT INTO users (name, gender) VALUES ('Kyra','Other');
INSERT INTO users (name, gender) VALUES ('Jermain','Gender neutral');
INSERT INTO users (name, gender) VALUES ('Kelli','Agender');
INSERT INTO users (name, gender) VALUES ('Jeffry','Two-spirit person');
INSERT INTO users (name, gender) VALUES ('Dawn','Male to female');
INSERT INTO users (name, gender) VALUES ('Ofelia','Cis female');
INSERT INTO users (name, gender) VALUES ('Icie','F2M');
INSERT INTO users (name, gender) VALUES ('Matilde','Trans');
INSERT INTO users (name, gender) VALUES ('Marcelina','Transgender female');
INSERT INTO users (name, gender) VALUES ('Destin','Male to female transsexual woman');
INSERT INTO users (name, gender) VALUES ('Reilly','Intersex man');
INSERT INTO users (name, gender) VALUES ('Casimer','Other');
INSERT INTO users (name, gender) VALUES ('Carli','Bigender');
INSERT INTO users (name, gender) VALUES ('Harry','Cis man');
INSERT INTO users (name, gender) VALUES ('Ellie','Omnigender');
INSERT INTO users (name, gender) VALUES ('Solon','Gender neutral');
INSERT INTO users (name, gender) VALUES ('Lesley','Cis');
INSERT INTO users (name, gender) VALUES ('Nikolas','Agender');
INSERT INTO companies (name, opened, active) VALUES ('Satterfield Inc', '2022-10-22 00:00:00', 1);
INSERT INTO companies (name, opened, active) VALUES ('Grimes - Reinger', '2022-11-22 00:00:00', 0);
INSERT INTO companies (name, opened, active) VALUES ('Skiles LLC', '2022-12-12 00:00:00', 0);
INSERT INTO companies (name, opened, active) VALUES ('White, Hermiston and Kihn', '2020-10-01 00:00:00', 1);
INSERT INTO companies (name, opened, active) VALUES ('Huel LLC', '2018-12-22 00:00:00', 1);
INSERT INTO companies (name, opened, active) VALUES ('Aufderhar - Schroeder', '2019-12-22 00:00:00', 1);
INSERT INTO companies (name, opened, active) VALUES ('Powlowski - VonRueden', '2014-12-22 00:00:00', 1);
INSERT INTO companies (name, opened, active) VALUES ('Murray - Hagenes', '2015-12-22 00:00:00', 1);
INSERT INTO companies (name, opened, active) VALUES ('Bednar LLC', '2013-12-22 00:00:00', 1);
INSERT INTO companies (name, opened, active) VALUES ('Kirlin - Bednar', '2011-12-22 00:00:00', 1);
INSERT INTO companies (name, opened, active) VALUES ('Kassulke - Auer', '2010-12-22 00:00:00', 1);
INSERT INTO companies (name, opened, active) VALUES ('Orn - Pouros', '2021-12-22 00:00:00', 1);
INSERT INTO companies (name, opened, active) VALUES ('Greenfelder - Paucek', '2009-12-22 00:00:00', 1);
INSERT INTO companies (name, opened, active) VALUES ('Hand, Effertz and Shields', '2000-12-22 00:00:00', 1);
INSERT INTO companies (name, opened, active) VALUES ('Harber - Heidenreich', '2001-12-22 00:00:00', 0);
INSERT INTO companies (name, opened, active) VALUES ('Greenholt - Durgan', '2000-12-22 00:00:00', 1);
INSERT INTO companies (name, opened, active) VALUES ('Hauck - Murazik', '2000-12-22 00:00:00', 0);
INSERT INTO companies (name, opened, active) VALUES ('Beier and Sons', '1999-12-22 00:00:00', 0);
INSERT INTO companies (name, opened, active) VALUES ('Harvey Inc', '2022-12-22 00:00:00', 1);
