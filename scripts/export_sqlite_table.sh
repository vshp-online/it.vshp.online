#!/usr/bin/env bash
# usage: ./export_sqlite_table.sh path/to/file.sql table_name

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <sql_file> <table_name>"
  exit 1
fi

input="$1"
table="$2"
mode="markdown"
output="table_${table}.md"

if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "sqlite3 not found in PATH"
  exit 1
fi

if [[ ! -f "$input" ]]; then
  echo "SQL file not found: $input"
  exit 1
fi

sqlite3 :memory: \
  ".read $input" \
  ".headers on" \
  ".mode $mode" \
  ".nullvalue 'NULL'" \
  ".once $output" \
  "SELECT * FROM \"$table\";"

echo "Saved -> $output"
