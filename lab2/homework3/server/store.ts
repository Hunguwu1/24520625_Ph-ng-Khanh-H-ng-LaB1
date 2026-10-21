import { DatabaseSync } from 'node:sqlite'
import type { FlashSale, Inventory, Product } from '../src/domain/models.ts'

export const product: Product = {
  id: 'product-001',
  name: 'Tai nghe Bluetooth',
  originalPrice: 599_000,
  salePrice: 299_000,
}

export const db = new DatabaseSync(':memory:')

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE inventory (
    productId TEXT PRIMARY KEY,
    total INTEGER NOT NULL CHECK (total >= 0),
    available INTEGER NOT NULL CHECK (available >= 0),
    reserved INTEGER NOT NULL CHECK (reserved >= 0),
    sold INTEGER NOT NULL CHECK (sold >= 0),
    version INTEGER NOT NULL CHECK (version >= 0),
    CHECK (total = available + reserved + sold)
  ) STRICT;

  CREATE TABLE reservations (
    id TEXT PRIMARY KEY,
    productId TEXT NOT NULL REFERENCES inventory(productId),
    userId TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    status TEXT NOT NULL CHECK (
      status IN ('ACTIVE', 'CONFIRMED', 'EXPIRED', 'CANCELLED')
    ),
    expiresAt INTEGER NOT NULL
  ) STRICT;

  CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  reservationId TEXT NOT NULL UNIQUE REFERENCES reservations(id),
  userId TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  totalAmount INTEGER NOT NULL CHECK (totalAmount >= 0),
  createdAt INTEGER NOT NULL
) STRICT; 
`)

db.prepare(`
  INSERT INTO inventory
    (productId, total, available, reserved, sold, version)
  VALUES (?, 10, 10, 0, 0, 0)
`).run(product.id)

export function getInventory(): Inventory {
  const row = db.prepare(
    'SELECT * FROM inventory WHERE productId = ?',
  ).get(product.id)

  if (!row) {
    throw new Error('INVENTORY_NOT_FOUND')
  }

  return {
    productId: String(row.productId),
    total: Number(row.total),
    available: Number(row.available),
    reserved: Number(row.reserved),
    sold: Number(row.sold),
    version: Number(row.version),
  }
}

const startsAt = Date.now()

export const flashSale: FlashSale = {
  id: 'sale-server-001',
  productId: product.id,
  startsAt,
  endsAt: startsAt + 5 * 60 * 1000,
}