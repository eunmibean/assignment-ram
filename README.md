# assignment-ram

**Scope:** one issue year per run (default **2018, 6,749 records**). The API limits paging depth, so loading one year keeps the run fast and the validation exact. Change `YEAR` in `src/index.ts` to load another year.

## How to run it

```bash
npm install
docker run -d --name permits-mysql \
  -e MYSQL_ROOT_PASSWORD=change_to_your_password -e MYSQL_DATABASE=permits \
  -p 3306:3306 mysql:8          # wait ~30s until "ready for connections"
cp .env.example .env            # edit if you used other values
npx tsx src/index.ts            # creates the table, loads, validates
npx vitest run                  # unit tests (no network or database needed)
```

## Tech Stack 
- Node.js 24
- TypeScript
- Docker
- MySQL 8

## Design Decisions
- Sort records by `permitnumber` to keep paginated results deterministic.
- Store monetary values in MySQL `DECIMAL` columns for fixed-point precision.
- Use `INSERT ... ON DUPLICATE KEY UPDATE` so reruns update existing records without deleting the table first.
- Fetch API pages sequentially to limit load on the public service.
- Pure transform functions, separated from I/O, so they are easy to test.
- Clean 6+ fields: dates (`YYYY-MM-DD` or `NULL`), numbers, text (line breaks and blanks), `propertyuse` array, and coordinates split into latitude/longitude.

## What I would improve with more time
- Load multiple years, with the year as a command-line argument.
- Stricter date validation (2026-13-45 currently passes the format check).
- Store skipped records for review; add an integration test against a MySQL container and CI.
- Persist import progress and resume interrupted imports from the last successfully stored page.
- Optional AI feature: classify permits by sector with an LLM, validated against a fixed list.

## AI tools I used and what I used them for
- **Claude Code** and **GitHub Copilot** were used as coding assistants (drafting code and tests, debugging TypeScript errors).
- I reviewed, ran, and tested everything, and I can explain every file in this repository.