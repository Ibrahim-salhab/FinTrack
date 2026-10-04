# ADR 001: Use PostgreSQL as Primary Relational Database

## Context
The Personal Finance Manager system requires strict ACID transactional guarantees, relational integrity between users, transactions, categories, and monthly budgets, compound indexing, and precise numerical calculations with fixed decimal scale (`NUMERIC(15, 2)`).

## Decision
We chose PostgreSQL as the primary production relational database managed via Flyway migrations, with an H2 in-memory compatibility fallback for rapid zero-dependency local testing.

## Alternatives Considered
- **MySQL / MariaDB:** Less flexible UUID handling and JSON capabilities.
- **MongoDB:** Lacks native strict multi-table foreign key constraints and ACID isolation necessary for financial accounts.

## Trade-offs
- Requires a PostgreSQL container or local service running in production.
- Migration scripts must be maintained in SQL (Flyway).
