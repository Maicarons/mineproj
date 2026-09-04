#!/usr/bin/env bash
# Performance benchmark script (M8-04)
# Measures build time for the example site using hyperfine.
# Usage: bash bench/build-time.sh [--quick]

set -euo pipefail
cd "$(dirname "$0")/.."

SITE="${1:-examples/basic}"
WARMUP="${2:-1}"
RUNS="${3:-5}"

echo "=== mineproj Build Benchmark ==="
echo "Site:      $SITE"
echo "Date:      $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "Node:      $(node --version)"
echo "Platform:  $(uname -s)"
echo ""

# Clean build
echo "Cleaning previous build..."
rm -rf "$SITE/dist"

if command -v hyperfine &> /dev/null; then
  echo "Running $RUNS benchmark runs with $WARMUP warmup(s)..."
  hyperfine \
    --warmup "$WARMUP" \
    --runs "$RUNS" \
    --export-json "bench/result-$(date +%s).json" \
    --prepare 'rm -rf dist' \
    --setup 'cd examples/basic' \
    "cd examples/basic && NODE_OPTIONS='' node ../../packages/cli/dist/cli.js build"
  echo ""
  echo "Results saved to bench/result-*.json"
else
  echo "hyperfine not found. Install with: cargo install hyperfine"
  echo "Running single timing instead..."
  START=$(date +%s%N)
  NODE_OPTIONS="" node packages/cli/dist/cli.js build --root "$SITE"
  END=$(date +%s%N)
  DURATION_MS=$(( (END - START) / 1000000 ))
  echo "Build time: ${DURATION_MS}ms ($(( DURATION_MS / 1000 ))s)"
  echo "{\"build_time_ms\": $DURATION_MS, \"site\": \"$SITE\", \"date\": \"$(date -u '+%Y-%m-%dT%H:%M:%SZ')\"}" > "bench/result-$(date +%s).json"
fi

echo "=== Benchmark complete ==="