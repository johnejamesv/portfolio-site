"""
One-shot generator for SpotCheck demo fixtures.

Reads real test data from C:/spotcheck/spotcheck/test-data/flights/*.json,
sanitizes (jitters GPS to a fixed dummy region), summarizes segments, and
emits components/spotcheck/fixtures.ts with TS literals.

Run once when the underlying test data changes:
    python scripts/build-spotcheck-fixtures.py
"""

from __future__ import annotations

import json
import statistics
from pathlib import Path
from typing import Any

REPO_TEST_DATA = Path(r"C:/spotcheck/spotcheck/test-data/flights")
OUT_TS = Path(__file__).resolve().parent.parent / "components" / "spotcheck" / "fixtures.ts"

# Fixed GPS offset to a generic dummy region (no real client coords).
# Real coords range across MI / MO; we shift everything to a single fictional
# site centered on this point and preserve relative offsets.
DUMMY_CENTER = (38.9072, -77.0369)  # Washington DC-ish, public landmark area

# Tolerance constants (match flightsorter-pseudocode.md)
GIMBAL_TOLERANCE_DEG = 3.0
FULL_ORBIT_DEG = 350.0
PARTIAL_ORBIT_MIN_DEG = 70.0

# Friendly names for the raw category strings produced by FlightSorter.
CATEGORY_DISPLAY = {
    "downlook": "Downlook orbit",
    "uplook": "Uplook orbit",
    "center in": "Center in",
    "center out": "Center out",
    "cable run": "Cable run",
    "cable anchor": "Cable anchor",
    "top down": "Top down",
    "tower flight type 1": "Tower flight (type 1)",
    "tower Flight type 2": "Tower flight (type 2)",
    "compound flight upper": "Compound — upper",
    "compound flight lower": "Compound — lower",
    "Orbit 1": "Orbit pass 1",
    "Orbit 2": "Orbit pass 2",
    "Orbit 3": "Orbit pass 3",
    "Descent 1": "Descent 1",
    "Descent 2": "Descent 2",
    "unknown flight category check gimbal angle": "Needs review (gimbal angle)",
    "center incorrect": "Center — incorrect",
}


def jitter_coords(records: list[dict]) -> tuple[float, float]:
    """Shift photo GPS so the centroid lands on DUMMY_CENTER, return offset."""
    if not records:
        return (0.0, 0.0)
    lats = [r["GPS Latitude"] for r in records if r.get("GPS Latitude")]
    lons = [r["GPS Longitude"] for r in records if r.get("GPS Longitude")]
    if not lats or not lons:
        return (0.0, 0.0)
    lat_off = DUMMY_CENTER[0] - (sum(lats) / len(lats))
    lon_off = DUMMY_CENTER[1] - (sum(lons) / len(lons))
    return (lat_off, lon_off)


def short_filename(unique: str) -> str:
    return unique.split("_", 1)[1] if "_" in unique else unique


def median_or(records: list[dict], key: str, fallback: float = 0.0) -> float:
    vals = [r[key] for r in records if r.get(key) is not None]
    return round(statistics.median(vals), 2) if vals else fallback


def rule_for(category: str, pitch: float, rotation: float | None, altitude: float, image_width: int) -> str:
    cat = category.lower()
    if "top down" in cat:
        return f"pitch {pitch:.0f}° within ±{GIMBAL_TOLERANCE_DEG:.0f}° of −90° → Top down"
    if "cable run" in cat:
        return f"pitch {pitch:.0f}° within ±{GIMBAL_TOLERANCE_DEG:.0f}° of −22°, altitude {altitude:.0f}m > 20m → Cable run"
    if "cable anchor" in cat:
        return f"image width {image_width}px < 5280px → Cable anchor (zoomed)"
    if "downlook" in cat:
        rot = f"{rotation:.0f}°" if rotation is not None else "—"
        return f"pitch {pitch:.0f}° within ±{GIMBAL_TOLERANCE_DEG:.0f}° of −35°, rotation {rot} ≥ 350° → Downlook orbit"
    if "uplook" in cat:
        rot = f"{rotation:.0f}°" if rotation is not None else "—"
        return f"pitch {pitch:.0f}° within ±{GIMBAL_TOLERANCE_DEG:.0f}° of +20°, rotation {rot} ≥ 70° → Uplook orbit"
    if "center in" in cat:
        return f"pitch {pitch:.0f}° within ±{GIMBAL_TOLERANCE_DEG:.0f}° of 0°, heading toward tower → Center in"
    if "center out" in cat:
        return f"pitch {pitch:.0f}° within ±{GIMBAL_TOLERANCE_DEG:.0f}° of 0°, heading away from tower → Center out"
    if "tower flight type 1" in cat:
        return f"pitch {pitch:.0f}° within ±{GIMBAL_TOLERANCE_DEG:.0f}° of −40° → Tower flight (type 1)"
    if "tower flight type 2" in cat.lower():
        return f"pitch {pitch:.0f}° within ±{GIMBAL_TOLERANCE_DEG:.0f}° of −50° → Tower flight (type 2)"
    if "compound flight upper" in cat:
        return f"pitch {pitch:.0f}° within ±{GIMBAL_TOLERANCE_DEG:.0f}° of −45° → Compound (upper)"
    if "compound flight lower" in cat:
        return f"pitch {pitch:.0f}° in range [−30°, −15°] → Compound (lower)"
    if "orbit" in cat:
        rot = f"{rotation:.0f}°" if rotation is not None else "—"
        return f"orbit-like rotation {rot}, pitch {pitch:.0f}° → {category}"
    if "descent" in cat:
        return f"descending altitude profile → {category}"
    if "unknown" in cat:
        return f"pitch {pitch:.0f}° outside known category windows → Needs review"
    return f"pitch {pitch:.0f}° → {category}"


def qa_status_for(category: str, rotation: float | None) -> str:
    cat = category.lower()
    if "unknown" in cat:
        return "NEEDS_REVIEW"
    if "orbit" in cat or "downlook" in cat or "uplook" in cat:
        if rotation is not None and rotation < PARTIAL_ORBIT_MIN_DEG:
            return "FAILED"
    return "PASSED"


def parse_rotation(raw: Any) -> float | None:
    if raw is None:
        return None
    if isinstance(raw, list):
        if not raw:
            return None
        raw = raw[0]
    if isinstance(raw, (int, float)):
        return float(raw)
    if isinstance(raw, str):
        try:
            return float(raw.split()[0])
        except (ValueError, IndexError):
            return None
    return None


def build_segment(category: str, photo_files: list[str], orbit_type: Any, rotation_raw: Any,
                   photo_lookup: dict[str, dict], lat_off: float, lon_off: float,
                   sample_size: int = 4) -> dict:
    records = [photo_lookup[f] for f in photo_files if f in photo_lookup]
    if not records:
        # passfail entry references missing photos; still emit a stub
        records = []

    pitch = median_or(records, "Gimbal Pitch Degree")
    altitude = median_or(records, "Relative Altitude")
    image_width = int(median_or(records, "Image Width", 4000))
    rotation = parse_rotation(rotation_raw)

    # Pick evenly-spaced sample photos for visual texture
    sample = []
    if records:
        step = max(1, len(records) // sample_size)
        picks = records[::step][:sample_size]
        for r in picks:
            sample.append({
                "fileName": r.get("File Name", "DJI_UNKNOWN.JPG"),
                "createDate": r.get("Create Date", ""),
                "lat": round(r.get("GPS Latitude", 0) + lat_off, 6),
                "lon": round(r.get("GPS Longitude", 0) + lon_off, 6),
                "altitude": r.get("Relative Altitude", 0),
                "gimbalPitch": r.get("Gimbal Pitch Degree", 0),
                "gimbalYaw": r.get("Gimbal Yaw Degree", 0),
                "imageWidth": r.get("Image Width", 0),
            })

    orbit_t = orbit_type if isinstance(orbit_type, str) else (orbit_type[0] if orbit_type else "N/A")
    display = CATEGORY_DISPLAY.get(category, category.title())

    return {
        "id": category.replace(" ", "-").lower(),
        "category": display,
        "rawCategory": category,
        "photoCount": len(photo_files),
        "orbitType": orbit_t,
        "totalRotation": rotation,
        "medianPitch": pitch,
        "medianAltitude": altitude,
        "imageWidth": image_width,
        "rule": rule_for(category, pitch, rotation, altitude, image_width),
        "qaStatus": qa_status_for(category, rotation),
        "samplePhotos": sample,
    }


def build_sample(json_path: Path, sample_id: str, name: str, description: str,
                  required_categories: list[str]) -> dict:
    raw = json.loads(json_path.read_text())
    photos = raw.get("photos", [])
    passfail = raw.get("passfail_result", [])
    summary = raw.get("summary", {})

    lat_off, lon_off = jitter_coords(photos)
    photo_lookup = {p["Unique Identifier"]: p for p in photos if "Unique Identifier" in p}

    segments = [
        build_segment(
            entry["Flight Category"],
            entry.get("Photos", []),
            entry.get("Orbit Type", "N/A"),
            entry.get("Total Rotation"),
            photo_lookup,
            lat_off,
            lon_off,
        )
        for entry in passfail
    ]

    time_range = summary.get("time_range", {})
    altitude_range = summary.get("altitude_range", {})
    pitch_range = summary.get("gimbal_pitch_range", {})

    return {
        "id": sample_id,
        "name": name,
        "description": description,
        "photoCount": summary.get("photo_count", len(photos)),
        "timeRange": time_range,
        "altitudeRange": altitude_range,
        "pitchRange": pitch_range,
        "requiredCategories": required_categories,
        "segments": segments,
    }


def synth_correction(clean_sample: dict) -> dict:
    """
    Build a v2 correction for the clean sample by replacing the NEEDS_REVIEW
    segment with an in-spec re-flight.

    Story: pilot saw the borderline gimbal-angle bucket flagged, repointed
    the gimbal, re-flew that pass, and produced a clean center-in segment.
    """
    new_segments = []
    replaced_id = None
    for seg in clean_sample["segments"]:
        if seg["qaStatus"] == "NEEDS_REVIEW" and replaced_id is None:
            replaced_id = seg["id"]
            new_segments.append({
                **seg,
                "id": "center-in-refly",
                "category": "Center in (re-fly)",
                "rawCategory": "center in",
                "rule": (
                    f"pitch −1° within ±{GIMBAL_TOLERANCE_DEG:.0f}° of 0°, "
                    "heading toward tower → Center in"
                ),
                "qaStatus": "PASSED",
                "medianPitch": -1.0,
                "version": 2,
                "note": "Re-flown after v1 flagged ambiguous gimbal angle.",
            })
        else:
            new_segments.append({**seg, "version": 1})
    return {
        **clean_sample,
        "id": clean_sample["id"] + "-v2",
        "segments": new_segments,
        "replacedSegmentId": replaced_id,
    }


def to_ts_literal(value: Any, indent: int = 0) -> str:
    pad = "  " * indent
    pad_inner = "  " * (indent + 1)
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return repr(value)
    if isinstance(value, str):
        escaped = value.replace("\\", "\\\\").replace('"', '\\"')
        return f'"{escaped}"'
    if isinstance(value, list):
        if not value:
            return "[]"
        items = [pad_inner + to_ts_literal(v, indent + 1) for v in value]
        return "[\n" + ",\n".join(items) + f"\n{pad}]"
    if isinstance(value, dict):
        if not value:
            return "{}"
        items = []
        for k, v in value.items():
            key = k if k.replace("_", "").isalnum() and not k[0].isdigit() else f'"{k}"'
            items.append(f"{pad_inner}{key}: {to_ts_literal(v, indent + 1)}")
        return "{\n" + ",\n".join(items) + f"\n{pad}}}"
    raise TypeError(f"Unhandled type: {type(value)}")


HEADER = """// AUTO-GENERATED by scripts/build-spotcheck-fixtures.py
// Source: C:/spotcheck/spotcheck/test-data/flights/*.json
// GPS coordinates have been jittered to a fixed dummy region.
// Edit the script, not this file.

import type { Sample } from "./types";

"""


def main() -> None:
    clean = build_sample(
        REPO_TEST_DATA / "249MEDIA.json",
        sample_id="clean-site",
        name="Clean inspection · 293 photos",
        description=(
            "A standard tower site flown end-to-end: downlook orbit, uplook orbit, "
            "center-in/out passes, a cable run, and a small ambiguous bucket the "
            "metadata-first pass flags for review before upload."
        ),
        required_categories=[
            "downlook", "uplook", "center in", "center out", "cable run", "top down",
        ],
    )
    tower = build_sample(
        REPO_TEST_DATA / "248MEDIA.json",
        sample_id="tower-site",
        name="Tower-heavy job · 379 photos",
        description=(
            "A tower-heavy capture set with three orbit passes, two descents, and "
            "compound upper/lower passes. Useful for showing how FlightSorter "
            "decomposes a busier flight log into structured segments."
        ),
        required_categories=[
            "tower flight type 2", "compound flight upper", "compound flight lower",
            "Orbit 1", "Orbit 2", "Orbit 3",
        ],
    )
    smoke = build_sample(
        REPO_TEST_DATA / "source_photos.json",
        sample_id="smoke",
        name="Smoke test · 2 photos",
        description=(
            "The smallest possible drop: one top-down photo and one cable-anchor "
            "photo. Shows the pure metadata-only path with no orbit logic."
        ),
        required_categories=["top down", "cable anchor"],
    )

    correction = synth_correction(clean)

    out = {
        "samples": [clean, tower, smoke],
        "correction": correction,
        "tolerances": {
            "gimbalDeg": GIMBAL_TOLERANCE_DEG,
            "fullOrbitDeg": FULL_ORBIT_DEG,
            "partialOrbitMinDeg": PARTIAL_ORBIT_MIN_DEG,
        },
    }

    body = (
        HEADER
        + f"export const samples: Sample[] = {to_ts_literal(out['samples'])};\n\n"
        + f"export const correction: Sample = {to_ts_literal(out['correction'])};\n\n"
        + f"export const tolerances = {to_ts_literal(out['tolerances'])} as const;\n"
    )

    OUT_TS.write_text(body, encoding="utf-8")
    print(f"Wrote {OUT_TS} ({len(body)} bytes)")
    for s in out["samples"]:
        print(f"  - {s['id']}: {len(s['segments'])} segments, {s['photoCount']} photos")


if __name__ == "__main__":
    main()
