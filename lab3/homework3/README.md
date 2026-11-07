# Flash Sale E-Commerce Engine

HW3 simulates a flash sale for the Vietnamese market, including a countdown synchronized with server time, temporary inventory reservations, checkout, and concurrent purchase tests.

## Technology and Environment

- Frontend: TypeScript, Vite, HTML, and CSS.
- Backend: Node.js, `node:http`, and SQLite through `node:sqlite`.
- Testing: `node:test`, `assert`, and `tsx`.
- Verified environment: Node.js 24.19.0 and Windows PowerShell.

## Running the Application

Install dependencies from the project directory:

```powershell
npm.cmd ci
```

Open the first terminal to run the backend:

```powershell
npm.cmd run dev:server
```

Open a second terminal in the same directory to run the frontend:

```powershell
npm.cmd run dev
```

Visit http://127.0.0.1:5173. The backend uses port 3000, and Vite forwards `/api` requests to it. Press `Ctrl+C` in the corresponding terminal to stop either server.

Each backend restart recreates the demo data: 10 units in stock, a sale price of VND 299,000, and a sale that starts immediately and lasts 30 minutes by default. Each reservation lasts up to 30 seconds and cannot extend beyond the end of the sale.

To configure a 60-minute sale, set the duration before starting the backend:

```powershell
$env:FLASH_SALE_DURATION_MS = '3600000'
npm.cmd run dev:server
```

The value is measured in milliseconds and must be a positive integer. It is read when the backend starts; refreshing the page does not reset the sale. To restore the default, stop the backend, run the following command, and restart it:

```powershell
Remove-Item Env:FLASH_SALE_DURATION_MS -ErrorAction SilentlyContinue
```

## Decomposition

| Component | Responsibility |
| --- | --- |
| `src/domain/models.ts` | Defines product, inventory, reservation, and order types |
| `src/domain/reservation.ts` | Defines allowed reservation state transitions |
| `src/timer/countdown.ts` | Calculates and formats the remaining time |
| `src/api/client.ts` | Calls the API and estimates the clock offset |
| `src/main.ts` | Displays products, handles reservations and checkout, and stores the current reservation within the tab |
| `server/store.ts` | Initializes the in-memory SQLite database and demo data |
| `server/reservations.ts` | Reserves inventory through conditional updates and a transaction |
| `server/expiration.ts` | Releases expired reservations |
| `server/checkout.ts` | Confirms orders and handles repeated checkout requests |
| `server/app.ts` | Creates the HTTP server and defines API routes |
| `server/index.ts` | Starts the server on port 3000 |

## Countdown Without Accumulated Drift

On each display update, the countdown recalculates the remaining time from the deadline:

```ts
const remainingMs = Math.max(0, endsAt - Date.now())
```

`requestAnimationFrame()` schedules the next frame. The timer does not subtract a fixed amount after each callback. When a background tab becomes active again, the remaining time is recalculated from the deadline, avoiding accumulated error from delayed callbacks.

The frontend estimates its clock offset using `serverNow` from the API. The display uses `MM:SS.mmm`, but rendering frequency depends on the browser; an update every millisecond is not guaranteed. System clock changes may temporarily affect the display. The backend always decides whether the sale or reservation is still valid.

## Inventory and State Machine

The following invariants must always hold:

```text
total = available + reserved + sold
available >= 0, reserved >= 0, sold >= 0
```

- Reservation: decreases `available`, increases `reserved`, and increments `version`.
- Expiration: changes `ACTIVE` to `EXPIRED` and moves units from `reserved` back to `available`.
- Checkout: changes `ACTIVE` to `CONFIRMED`, moves units from `reserved` to `sold`, and creates an order.
- `CANCELLED` exists in the domain model, but a cancellation API has not been implemented.

The reservation SQL updates inventory only when `version = expectedVersion` and sufficient stock is available. Inventory changes and reservation creation occur in the same transaction. A failed write rolls back all changes in that transaction.

Reservation, expiration, and checkout functions each manage their own transaction. Expiration runs before opening the reservation or checkout transaction to avoid nested transactions.

Checkout validates ownership, status, and expiration. `orders.reservationId` has a `UNIQUE` constraint. Repeated checkout requests return the existing order, including requests made after the reservation deadline if the order was successfully created before expiration. Price and quantity come from backend data.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Checks backend availability |
| GET | `/api/products/product-001` | Returns the product, inventory, sale, and server time |
| POST | `/api/reservations` | Reserves stock using `productId`, `userId`, `quantity`, and `expectedVersion` |
| POST | `/api/checkout` | Checks out using `reservationId` and `userId` |

POST requests require `Content-Type: application/json` and accept a maximum body size of 16 KiB. Errors use a response such as `{ "error": "VERSION_CONFLICT" }`. Business errors include `OUT_OF_STOCK`, `SALE_INACTIVE`, `RESERVATION_EXPIRED`, and `FORBIDDEN`.

## Testing

```powershell
npm.cmd test
npm.cmd run build
```

The full test command runs four top-level tests:

1. Reservation: validates quantity, version checks, and rollback after a failed reservation insert.
2. Expiration: checks behavior before and at the deadline, releases stock only once, and verifies rollback.
3. Checkout: checks ownership, expiration, order reuse, and rollback.
4. Concurrency: simulates 100 buyers competing for 10 units; two checkout requests per reservation still produce only 10 orders.

To run only the concurrency test:

```powershell
npm.cmd run test:concurrency
```

The first wave uses the same inventory version: one request succeeds and 99 encounter a version conflict. The remaining buyers read the latest version and retry within a fixed limit. In total, 10 reservations succeed and 90 buyers cannot obtain stock. After checkout, inventory must be `available = 0`, `reserved = 0`, and `sold = 10`, with exactly 10 orders.

The HTTP test uses an available port assigned by the operating system and database state within the test process. It does not change inventory in the running demo server.

## Manual Demo

The interface currently uses Vietnamese labels.

1. Open the page while the sale is active and click **Mua ngay** (Buy now). Available stock decreases by one, and the reservation countdown appears.
2. Refresh the page in the same tab. The reservation and its deadline are restored without creating another reservation.
3. Click **Thanh toán** (Checkout) before the deadline. The order ID and total amount appear.
4. Reserve another unit and wait more than 30 seconds. The reservation expires and the stock becomes available again.
5. When the sale ends, the countdown reaches zero and the buy button is disabled, even if stock remains.

## Limitations

- SQLite runs in memory. Restarting the backend deletes reservations and orders and resets inventory.
- This is a single-process demo. The 100-buyer test checks concurrency correctness; it does not establish support for multiple instances or production throughput.
- `userId` simulates a user identity within a browser tab. Login and authorization based on authenticated sessions are not implemented.
- Checkout simulates purchase confirmation; no payment gateway is integrated.
- Reservation creation has no idempotency key. If the backend reserves stock but its response is lost, the frontend may be unaware of that reservation; the stock is released when it expires.
- This project does not configure an API proxy for `vite preview`. The startup instructions above apply to development mode.

## Commit History and Audit

The project uses Conventional Commits and has more than eight commits covering individual features. View the history with `git log --oneline -- .`.

See `AI_FAILURE_AUDIT.md` for observed incidents, fixes, verification evidence, and limitations in attributing errors to AI.
