import duckdb
from pathlib import Path
import os

con = duckdb.connect()

# ----------------------------------------------------------------------
# Demo data (keep or replace)
# ----------------------------------------------------------------------
con.execute("""
CREATE TABLE sparse_data(id INTEGER, a INTEGER, b INTEGER, c INTEGER);
INSERT INTO sparse_data VALUES
  (1, 0, 5, 0),
  (2, 3, 0, 0),
  (3, 0, 0, 7),
  (4, 0, 0, 0);
""")

# ----------------------------------------------------------------------
# 1-column result → CSV (no header, no quoting) ⇒ perfect NDJSON
# ----------------------------------------------------------------------
out = Path("sparse_output.jsonl").resolve()

con.execute(f"""
COPY (
    SELECT
        to_json(                              -- JSON value …
            json_object(                      -- … built per row
                'a', CASE WHEN a <> 0 THEN a END,
                'b', CASE WHEN b <> 0 THEN b END,
                'c', CASE WHEN c <> 0 THEN c END
            )
        )::VARCHAR AS json_line               -- cast → plain text
    FROM sparse_data
)
TO '{out.as_posix()}'
( FORMAT CSV,          -- use CSV writer
  HEADER FALSE,        -- no header row
  QUOTE ''             -- *disable* quoting entirely
);                      -- (only 1 column => delimiter never appears)
""")

print(f"✅  Wrote {out}  ({os.path.getsize(out):,} bytes)")
