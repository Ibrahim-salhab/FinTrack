# ADR 003: Use Modular Monolith Architecture

## Context
A full microservices architecture for a personal finance application introduces distributed transactions (Sagas), service meshes, complex deployments, and significant latency and operational overhead without any real benefit for this domain size.

## Decision
We chose a **Modular Monolith** architecture for the Spring Boot backend with clean module boundaries (`auth`, `transaction`, `category`, `budget`, `report`, `common`).

## Alternatives Considered
- **Microservices (Auth Service, Transaction Service, Budget Service, Analytics Service):** Overengineered, complicates transactional rollbacks, requires message queues and multiple databases.

## Trade-offs
- Single deployment artifact (`backend.jar`), which simplifies operations and reduces cloud costs dramatically.
- Modular domain boundaries ensure that if high scale is ever needed, individual domains can be cleanly extracted.
