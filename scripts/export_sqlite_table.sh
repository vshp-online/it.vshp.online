#!/usr/bin/env bash
# usage: ./export_sqlite_table.sh path/to/file.sql [output_dir] [--tables=tbl1,tbl2]

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <sql_file> [output_dir] [--tables=tbl1,tbl2]"
  exit 1
fi

input="$1"
mode="markdown"
requested_dir=""
table_filter=""

for arg in "${@:2}"; do
  case "$arg" in
    --tables=*)
      table_filter="${arg#--tables=}"
      ;;
    *)
      requested_dir="$arg"
      ;;
  esac
done

if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "sqlite3 not found in PATH"
  exit 1
fi

if [[ ! -f "$input" ]]; then
  echo "SQL file not found: $input"
  exit 1
fi

base_name="$(basename "$input")"
db_stub="${base_name%.sql}"
db_stub="${db_stub%_sqlite}"
default_dir="${db_stub}_db"
output_dir="${requested_dir:-$default_dir}"
mkdir -p "$output_dir"

tables_raw="$(sqlite3 :memory: ".read $input" "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;")"
all_tables=()
while IFS= read -r tbl; do
  [[ -z "$tbl" ]] && continue
  all_tables+=("$tbl")
done <<< "$tables_raw"

if [[ ${#all_tables[@]} -eq 0 ]]; then
  echo "No tables found in $input"
  exit 1
fi

export_tables=("${all_tables[@]}")

if [[ -n "$table_filter" ]]; then
  IFS=',' read -ra requested_tables <<< "$table_filter"
  export_tables=()
  for tbl in "${requested_tables[@]}"; do
    tbl="${tbl// /}"
    if [[ -z "$tbl" ]]; then
      continue
    fi
    found=0
    for existing in "${all_tables[@]}"; do
      if [[ "$existing" == "$tbl" ]]; then
        found=1
        break
      fi
    done
    if [[ $found -eq 0 ]]; then
      echo "Table not found in schema: $tbl"
      exit 1
    fi
    export_tables+=("$tbl")
  done
fi

if [[ ${#export_tables[@]} -eq 0 ]]; then
  echo "No tables selected for export"
  exit 1
fi

for table in "${export_tables[@]}"; do
  table_stub="$(echo "$table" | tr '[:upper:]' '[:lower:]')"
  table_stub="${table_stub// /_}"
  output="${output_dir}/${table_stub}_table.md"

  sqlite3 :memory: <<SQL
.read "$input"
.headers on
.mode $mode
.nullvalue 'NULL'
.once "$output"
SELECT * FROM "$table";
SQL

  echo "Saved -> $output"
done
