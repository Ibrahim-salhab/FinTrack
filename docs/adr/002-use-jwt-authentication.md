# ADR 002: Use Stateless JWT Bearer Authentication

## Context
The system consists of a detached React Single Page Application (SPA) communicating over REST with a Spring Boot backend. The API should scale horizontally without session stickiness or distributed session stores (like Redis session caches) for the MVP.

## Decision
We chose stateless JSON Web Tokens (JWT) signed with HMAC-SHA256 (`jjwt-api 0.12.6`). Tokens encapsulate user ID and email claims, with a standard 24-hour expiration window.

## Alternatives Considered
- **Stateful HTTP Sessions (JSESSIONID):** Requires sticky sessions or distributed session replication when scaled across multiple containers; introduces CSRF complications for REST clients.
- **OAuth2 / External IDP (Auth0 / Keycloak):** Adds external dependencies and deployment friction for a standalone personal finance manager.

## Trade-offs
- Tokens cannot be revoked server-side before expiration unless a token blacklist is implemented in a cache.
- The client must securely store the token in local storage.
