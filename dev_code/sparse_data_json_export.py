import duckdb, os
from pathlib import Path

con = duckdb.connect()

# ------------------------------------------------------------------
# demo table -------------------------------------------------------
con.execute("""
CREATE TABLE sparse_data(id INTEGER, a INTEGER, b INTEGER, c INTEGER);
INSERT INTO sparse_data VALUES
  (1, 0, 5, 0),
  (2, 3, 0, 0),
  (3, 0, 0, 7),
  (4, 0, 0, 0);
""")

# ------------------------------------------------------------------
# copy one VARCHAR column → CSV writer (tab delimiter, odd quote) --
#   * json_merge_patch removes null keys
#   * QUOTE '|' avoids the normal '"' quote char, so the JSON lines
#     are written verbatim
# ------------------------------------------------------------------
out = Path("sparse_output.jsonl").resolve()

con.execute(f"""
COPY (
    SELECT
        json_merge_patch(
            '{{}}',                         -- start from empty object
            json_object(                    -- add keys (NULL means "maybe drop")
                'a', CASE WHEN a <> 0 THEN a END,
                'b', CASE WHEN b <> 0 THEN b END,
                'c', CASE WHEN c <> 0 THEN c END
            )
        )::VARCHAR AS json_line
    FROM sparse_data
)
TO '{out.as_posix()}'
( FORMAT CSV,
  HEADER FALSE,
  DELIMITER '\t',   -- tab never occurs inside the JSON
  QUOTE '|'         -- choose a quote char that never occurs either
);
""")

print(f"✅ wrote {out} ({os.path.getsize(out):,} bytes)")
