# Fliq — Product Language

The canonical vocabulary for how Fliq's product concepts are named in
user-facing surfaces (marketing site, dashboard, docs). Keeps code, docs, and
marketing copy describing the same thing with the same word. Glossary only — no
implementation detail, no design rationale (those live in
`core-api/docs/design/`).

## Language

**Buffer**:
A per-client ordered stream: you push items and Fliq delivers them to one
target URL in submission order, at a defined rate. Solves outbound
rate-limiting + ordering without Redis.
_Avoid_: Queue (it is not a message queue), channel, rate limiter (rate limiting
is one of its properties, not the whole concept).

**Item**:
A single request pushed onto a Buffer, delivered in turn to the Buffer's target.
_Avoid_: Message, task, event.
