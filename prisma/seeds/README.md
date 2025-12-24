# Prisma Seeds

This directory contains database seed files organized by entity for better maintainability and scalability.

## Structure

```
prisma/seeds/
├── index.ts              # Main seed orchestrator
├── utils.ts              # Shared utilities (password hashing, etc.)
├── employee.seed.ts      # Employee seed data
└── customer.seed.ts      # Customer seed data
```

## Files

### `index.ts`

Main entry point that orchestrates all seed functions. This file:

- Creates the Prisma client instance
- Imports and executes all seed functions in order
- Handles errors and cleanup

### `utils.ts`

Shared utility functions used across different seed files:

- `hashPassword()` - Bcrypt password hashing function

### `employee.seed.ts`

Seeds employee data with 5 employees across different roles:

- 1 Admin
- 2 Receptionists
- 1 Housekeeping staff
- 1 General staff

**Default credentials**: All employees use `password123`

### `customer.seed.ts`

Seeds customer data with 10 customers with realistic Vietnamese information:

- Full names
- Phone numbers
- Email addresses
- ID numbers (CMND/CCCD)
- Addresses in various districts of Ho Chi Minh City

**Default credentials**: All customers use `password123`

## Running Seeds

To run all seeds:

```bash
npx prisma db seed
```

or

```bash
yarn prisma db seed
```

## Adding New Seeds

To add a new entity seed:

1. Create a new file: `prisma/seeds/[entity].seed.ts`
2. Export a seed function that accepts `PrismaClient`:

   ```typescript
   import { PrismaClient } from '@prisma/client';

   export const seedEntityName = async (prisma: PrismaClient): Promise<void> => {
     console.log('Seeding entity...');

     // Your seed logic here

     console.log('✓ Created X entities');
   };
   ```

3. Import and call it in `index.ts`:

   ```typescript
   import { seedEntityName } from './entity.seed';

   // In main function:
   await seedEntityName(prisma);
   ```

## Seed Data

### Employees

| Username      | Password    | Role         | Name             |
| ------------- | ----------- | ------------ | ---------------- |
| admin         | password123 | ADMIN        | Nguyễn Văn Admin |
| receptionist1 | password123 | RECEPTIONIST | Trần Thị Lan     |
| receptionist2 | password123 | RECEPTIONIST | Lê Văn Hùng      |
| housekeeping1 | password123 | HOUSEKEEPING | Phạm Thị Mai     |
| staff1        | password123 | STAFF        | Hoàng Văn Tùng   |

### Customers

| Phone      | Password    | Name            | Email                     |
| ---------- | ----------- | --------------- | ------------------------- |
| 0901234567 | password123 | Nguyễn Văn An   | nguyenvanan@example.com   |
| 0902345678 | password123 | Trần Thị Bình   | tranthibinh@example.com   |
| 0903456789 | password123 | Lê Văn Cường    | levancuong@example.com    |
| 0904567890 | password123 | Phạm Thị Dung   | phamthidung@example.com   |
| 0905678901 | password123 | Hoàng Văn Em    | hoangvanem@example.com    |
| 0906789012 | password123 | Đặng Thị Phương | dangthiphuong@example.com |
| 0907890123 | password123 | Vũ Văn Giang    | vuvangiang@example.com    |
| 0908901234 | password123 | Bùi Thị Hoa     | buithihoa@example.com     |
| 0909012345 | password123 | Đinh Văn Ích    | dinhvanich@example.com    |
| 0900123456 | password123 | Mai Thị Kim     | maithikim@example.com     |

## Notes

- All seed functions use `upsert` to avoid duplicate entries
- Passwords are hashed using bcrypt with a salt round of 10
- Seed data is idempotent - running it multiple times won't create duplicates
- All Vietnamese characters are properly encoded in UTF-8
