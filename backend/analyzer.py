import re


def analyze_eda_error(error: str):
    """
    Lightweight EDA error analyzer for the MVP.

    Designed so that an LLM provider can be plugged
    into this function later without changing the API.
    """

    text = error.lower()

    # Liberty / OpenSTA
    if (
        "liberty" in text
        or ".lib" in text
        or "lib file" in text
    ):
        return {
            "root_cause": "Incorrect or missing Liberty (.lib) file path.",
            "recommendation": (
                "Verify that the Liberty file exists and that "
                "the OpenSTA configuration points to the correct "
                ".lib file path."
            ),
            "confidence": 0.94,
            "category": "Timing / Library"
        }

    # Clock errors
    if (
        "clock not found" in text
        or "clock" in text and "constraint" in text
        or "create_clock" in text
    ):
        return {
            "root_cause": "Clock constraint is missing or incorrectly defined.",
            "recommendation": (
                "Check the SDC constraints and verify that "
                "create_clock is correctly defined for the target clock port."
            ),
            "confidence": 0.91,
            "category": "Timing Constraints"
        }

    # Setup violation
    if (
        "setup violation" in text
        or "setup timing" in text
        or "setup slack" in text
    ):
        return {
            "root_cause": "The data path is too slow to satisfy the setup requirement.",
            "recommendation": (
                "Inspect the critical timing path and consider "
                "logic optimization, cell resizing, buffering, "
                "or pipeline restructuring."
            ),
            "confidence": 0.89,
            "category": "Static Timing Analysis"
        }

    # Hold violation
    if (
        "hold violation" in text
        or "hold timing" in text
        or "hold slack" in text
    ):
        return {
            "root_cause": "The data path is arriving too early for the hold requirement.",
            "recommendation": (
                "Inspect the affected path and consider adding "
                "delay cells, buffering, or adjusting the data path."
            ),
            "confidence": 0.88,
            "category": "Static Timing Analysis"
        }

    # Synthesis errors
    if (
        "synthesis" in text
        or "synth" in text
        or "yosys" in text
    ):
        return {
            "root_cause": "A synthesis input, RTL construct, or synthesis configuration may be invalid.",
            "recommendation": (
                "Check the RTL syntax, module hierarchy, included source files, "
                "and synthesis constraints."
            ),
            "confidence": 0.76,
            "category": "Synthesis"
        }

    # Routing
    if (
        "routing" in text
        or "route" in text
        or "congestion" in text
    ):
        return {
            "root_cause": "The design may have routing congestion or an invalid routing configuration.",
            "recommendation": (
                "Inspect congestion hotspots, routing constraints, "
                "floorplanning, and placement quality."
            ),
            "confidence": 0.74,
            "category": "Physical Design"
        }

    # Generic EDA error
    return {
        "root_cause": (
            "The error does not match a known EDA failure pattern."
        ),
        "recommendation": (
            "Inspect the complete EDA log, verify input files "
            "and tool configuration, and check the first error "
            "reported in the log."
        ),
        "confidence": 0.60,
        "category": "General EDA"
    }