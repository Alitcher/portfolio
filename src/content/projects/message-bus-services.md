## Overview

A set of event-driven microservices communicating over RabbitMQ, with gRPC for
synchronous calls and PostgreSQL for persistence. The whole stack is
containerised and reproducible with a single `docker compose up`.

## Lessons Learned

- Designing idempotent consumers for at-least-once delivery.
- Tracing a request across service boundaries.
- Keeping local dev environments reproducible with Docker.
