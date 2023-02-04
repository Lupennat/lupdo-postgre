# Changelog

All notable changes to this project from 1.0.0 forward will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2023-02-03

### Fixed

-   Typo Postgress fixed

## [1.4.1] - 2023-02-03

### Changed

-   The `host` option now also accepts a list of `host:port`; the pool will generate the connection using a random host from the list.

## [1.3.1] - 2023-01-20

### Added

-   `createPostgresPdo` function exported to better typing postgresOptions

## [1.3.0] - 2023-01-10

### Changed

-   Update to Lupdo ^3.0.0

## [1.2.0] - 2023-01-08

### Changed

-   `pdo.lastInsertId(name?)` can retrieve lastInsertId

## [1.1.0] - 2023-01-06

### Added

-   Question mark supported on sql query.

### Changed

-   Updated to Lupdo v2.1.0.

### Fixed

-   Postgres Type Parser.

## [1.0.0] - 2022-12-29

First Public Release On Npm
