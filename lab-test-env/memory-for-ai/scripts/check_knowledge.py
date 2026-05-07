#!/usr/bin/env python3
"""
check_knowledge.py — Validates KNOWLEDGE.json for the Memory for AI lab.

Run: python scripts/check_knowledge.py
"""

import json
import sys
from pathlib import Path

KNOWLEDGE_PATH = Path(__file__).parent.parent / "KNOWLEDGE.json"
MIN_ENTRIES = 3
REQUIRED_FIELDS = ["concept", "sql_instinct_overridden", "rule", "when_to_apply", "confidence"]
VALID_CONFIDENCE = {"verified", "corrected", "self-assessed"}

# Lab-specific coverage checks: at least one entry must match each
COVERAGE_CHECKS = [
    {
        "label": "namespace isolation or multi-tenant memory",
        "test": lambda e: any(
            kw in f"{e.get('concept','')} {e.get('rule','')} {e.get('when_to_apply','')}".lower()
            for kw in ["namespace", "isolation", "tenant", "user"]
        ),
    },
    {
        "label": "vector search or semantic retrieval",
        "test": lambda e: any(
            kw in f"{e.get('concept','')} {e.get('rule','')} {e.get('when_to_apply','')}".lower()
            for kw in ["vector", "embed", "semantic", "retriev"]
        ),
    },
    {
        "label": "short-term vs long-term memory distinction",
        "test": lambda e: any(
            kw in f"{e.get('concept','')} {e.get('rule','')}".lower()
            for kw in ["short", "long", "checkpointer", "saver", "store", "persist"]
        ),
    },
]


def check_knowledge():
    results = []
    passed = True

    # 1. File exists
    if not KNOWLEDGE_PATH.exists():
        print("✗ KNOWLEDGE.json not found.")
        print("  Create KNOWLEDGE.json in the lab root after completing the lab.")
        print("\nKnowledge Check: FAIL")
        sys.exit(1)
    results.append("✓ KNOWLEDGE.json exists")

    # 2. Valid JSON
    try:
        with open(KNOWLEDGE_PATH, "r", encoding="utf-8") as f:
            entries = json.load(f)
    except json.JSONDecodeError as e:
        print(f"✗ KNOWLEDGE.json: invalid JSON — {e}")
        print("\nKnowledge Check: FAIL")
        sys.exit(1)
    results.append("✓ Valid JSON")

    # 3. Is a list
    if not isinstance(entries, list):
        print("✗ KNOWLEDGE.json must be a JSON array of knowledge entries")
        print("\nKnowledge Check: FAIL")
        sys.exit(1)
    results.append("✓ Is a JSON array")

    # 4. Minimum entry count
    if len(entries) < MIN_ENTRIES:
        results.append(
            f"✗ Entry count: {len(entries)} (need ≥ {MIN_ENTRIES}). "
            "Add a knowledge entry for each major concept you learned."
        )
        passed = False
    else:
        results.append(f"✓ Entry count: {len(entries)} (≥ {MIN_ENTRIES})")

    # 5. Required fields on every entry
    fields_ok = True
    for i, entry in enumerate(entries):
        concept_label = entry.get("concept", "unnamed")
        missing = [f for f in REQUIRED_FIELDS if not str(entry.get(f, "")).strip()]
        if missing:
            results.append(f'✗ Entry {i + 1} ("{concept_label}"): missing fields — {", ".join(missing)}')
            fields_ok = False
        conf = entry.get("confidence", "")
        if conf and conf not in VALID_CONFIDENCE:
            results.append(
                f'✗ Entry {i + 1}: confidence must be one of: '
                f'{", ".join(sorted(VALID_CONFIDENCE))} (got "{conf}")'
            )
            fields_ok = False
    if fields_ok:
        results.append("✓ All entries have required fields with valid confidence values")
    else:
        passed = False

    # 6. Lab-specific coverage
    for check in COVERAGE_CHECKS:
        covered = any(check["test"](e) for e in entries)
        if covered:
            results.append(f"✓ Coverage: {check['label']}")
        else:
            results.append(f"✗ Coverage: no entry covers {check['label']}")
            passed = False

    for r in results:
        print(r)

    print()
    if passed:
        print("Knowledge Check: PASS")
        sys.exit(0)
    else:
        print("Knowledge Check: FAIL")
        sys.exit(1)


if __name__ == "__main__":
    check_knowledge()
