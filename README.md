# e-commerce-sport-tracking

Velocity is a fictional sports e-commerce website built as the data source for an end-to-end user activity tracking pipeline. The app generates events such as product page visits, add-to-cart actions, cart removals, and completed purchases. Those events are written as local JSON files and then processed through Apache NiFi, MinIO, ClickHouse, ODBC, and Power BI.

## Project Overview

This repository combines two parts:

- A Next.js front-end that simulates a sports e-commerce store called Velocity.
- A data engineering pipeline that turns raw user events into analytics-ready tables and a Power BI dashboard.

The goal is to demonstrate a realistic event tracking workflow that mirrors how modern product analytics pipelines are built in production.

## Tracked Events

The application records the following user behaviors:

- `product_page`: a user opens a product page and views product details.
- `add_to_cart`: a product is added to the cart.
- `remove_from_cart`: a product is removed from the cart.
- `purchase_complete`: a checkout is completed successfully.

Each event is stored as JSON and includes metadata such as user information, product identifiers, cart totals, quantity, color, size, page details, and timestamps.

## Data Pipeline

### 1. Event generation in Velocity

Velocity acts as the source system. User interactions are captured in the application and stored locally as JSON files. This creates a reproducible event stream without requiring a live production backend.

### 2. Apache NiFi ingestion and transformation

Apache NiFi orchestrates the data flow with four processors:

- `GetFile` reads the JSON files from the local source folder.
- `UpdateRecord` flattens nested fields, especially values under `/metadata/`, so the output is easier to query downstream.
- `QueryRecord` cleans and reshapes the records, including timestamp normalization with `REPLACE`, and routes the result to the transformed stream.
- `PutS3Object` writes the transformed files to object storage.

This step reflects a common real-world pattern: ingest raw events, standardize the schema, and land them in durable object storage before loading them into the warehouse.

### 3. MinIO object storage

MinIO is used as an S3-compatible landing zone for the transformed JSON files. Files are partitioned by date and hour using a path like `yyyy/MM/dd/HH.json`, which supports incremental processing, replay, and time-based backfills.

### 4. ClickHouse analytics layer

ClickHouse consumes the MinIO data through a raw stream table and materialized views. The repository includes event-oriented tables and views for:

- `add_to_cart`
- `product_page`
- `purchase_complete`
- `remove_from_cart`

These structures make the data easy to query for behavioral analysis, conversion tracking, and funnel exploration.

### 5. ODBC connectivity

An ODBC data source on Windows connects Power BI directly to ClickHouse. The configured source, named `User Tracking`, points to `localhost:8123` and the `default` database.

### 6. Power BI dashboard

The final layer is a Power BI dashboard titled `Tracking Users Activity`. It visualizes user behavior through six main charts:

- products added by user
- products removed by user
- revenue by day
- product page visits over time
- average time in cart by user
- average time in cart by order

## Why This Pipeline Matches Best Practice

This project follows patterns used in real analytics architectures:

- Separation of concerns: the app generates events, NiFi transforms them, MinIO stores them, ClickHouse serves analytics, and Power BI handles reporting.
- Schema normalization: nested JSON is flattened before warehouse ingestion, which reduces downstream query complexity.
- Durable landing zone: object storage keeps a replayable copy of the data, which is useful for reprocessing and recovery.
- Time partitioning: day and hour partitions support incremental reads and easier backfills.
- Analytics-optimized serving layer: ClickHouse is well suited for high-speed aggregations and dashboard workloads.
- BI decoupling: Power BI reads from ClickHouse instead of the raw source, which keeps the reporting layer stable and performant.

In short, the pipeline mirrors a production-style ELT/analytics flow: event capture, file landing, transformation, warehouse modeling, and business intelligence.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Apache NiFi
- MinIO
- ClickHouse
- ODBC on Windows
- Power BI

## Repository Structure

- `app/`: Next.js app routes and pages.
- `components/`: shared UI and dashboard components.
- `hooks/`: React hooks used across the app.
- `lib/`: stores, types, data helpers, and utilities.
- `public/images/`: static assets.
- `styles/`: global styling.

## Getting Started

### Prerequisites

- Node.js 18+ recommended
- pnpm, npm, or yarn

### Install dependencies

```bash
pnpm install
```

If you prefer npm:

```bash
npm install
```

### Run the development server

```bash
pnpm dev
```

Or:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
pnpm build
```

### Start the production server

```bash
pnpm start
```

## Contact

GitHub: https://github.com/ismail703

LinkedIn: https://www.linkedin.com/in/ismail-el-main/
