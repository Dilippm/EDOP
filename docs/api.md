# API contract proposal

This is a Phase 0 contract sketch, not an implemented API. JSON examples omit common envelope metadata. All routes will be versioned under `/api/v1`, require authentication except health/readiness, validate request bodies, return structured errors, and emit correlation IDs. Exact schemas and status codes will be finalized with backend tests.

## Shared conventions

- `GET /health` returns process health; `GET /ready` reports dependency readiness without exposing secrets.
- Lists accept `limit`, `cursor` and relevant filters. Responses include `items` and `nextCursor`.
- Dates are RFC 3339 UTC timestamps. Identifiers are opaque strings.
- Error shape: `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [], "requestId": "..." } }`.
- Long-running workflow requests return `202 Accepted` with a durable operation resource. Clients poll the resource; they do not hold an HTTP connection open for CI, Terraform or deployment execution.

## Observation and catalog

| Method and route | Purpose |
|---|---|
| `GET /repositories` | List discovered/selected repositories; filters: `q`, `owner` |
| `POST /repositories` | Register an allowed repository for monitoring |
| `GET /services` | List service records and environment associations |
| `GET /services/:serviceId` | Read service details |
| `GET /pipelines` | List workflow runs; filters: `repository`, `status`, `branch`, `since` |
| `GET /pipelines/:runId` | Read run, jobs, timestamps and external log URL |
| `POST /webhooks/github` | Receive signature-validated, deduplicated GitHub events |
| `GET /deployments` | List deployments; filters: `serviceId`, `environmentId`, `status` |
| `GET /deployments/:deploymentId` | Read release provenance and rollout health |
| `GET /environments` | List authorized environment summaries |
| `GET /environments/:environmentId/health` | Read current workload and environment health |
| `GET /observability/services/:serviceId/summary` | Read time-bounded metrics and diagnostic links |

## Application release workflow

| Method and route | Purpose |
|---|---|
| `POST /services/:serviceId/deployments` | Request a release of an existing immutable image/version to an allowed environment |
| `GET /application-operations/:operationId` | Poll CI/GitOps/deployment progress and result |
| `POST /application-operations/:operationId/cancel` | Request cancellation when the underlying workflow supports it |
| `GET /services/:serviceId/deployments` | Read deployment history |

Request sketch:

```json
{ "environmentId": "env-dev", "image": "registry.example/app@sha256:…", "sourceRunId": "run-123", "idempotencyKey": "client-generated-key" }
```

The API authorizes the service/environment pair, checks that the image is immutable and permitted, records the requester and queues the release. It does not launch infrastructure operations.

## Infrastructure lifecycle workflow

| Method and route | Purpose |
|---|---|
| `GET /infrastructure/templates` | List approved environment templates |
| `GET /infrastructure/operations` | List operations visible to the caller |
| `POST /infrastructure/operations` | Request a `plan` for an approved template/environment |
| `GET /infrastructure/operations/:operationId` | Read operation state, plan summary and result |
| `POST /infrastructure/operations/:operationId/approvals` | Approve a specific plan digest if authorized |
| `POST /infrastructure/operations/:operationId/apply` | Queue apply for an approved, unchanged plan |
| `POST /infrastructure/operations/:operationId/destroy` | Queue separately authorized destroy after fresh plan and confirmation |
| `GET /infrastructure/operations/:operationId/events` | Read operation and audit history |

Request sketch:

```json
{ "environmentId": "aws-test", "templateId": "aws-test-v1", "operation": "plan", "inputs": { "region": "ap-south-1" }, "idempotencyKey": "client-generated-key" }
```

The client cannot provide Terraform command strings, arbitrary module paths, backend configuration, credentials or unrestricted resource definitions. Apply approval binds the actor, operation ID and plan digest. Destroy requires an explicit confirmation field and an independently enforced role/policy. State locking and a worker queue prevent overlapping state mutations.

## Operation state

Proposed states: `queued`, `running`, `awaiting_review`, `awaiting_approval`, `applying`, `verifying`, `succeeded`, `failed`, `cancelled`, `destroyed`. Transitions are validated server-side and recorded with actor, timestamp, reason and correlation ID. Detailed Terraform plans are treated as sensitive because they can contain values derived from secrets; store and expose a redacted, access-controlled representation.
