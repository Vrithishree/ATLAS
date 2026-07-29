from App.tools.scanner import run_nmap_discovery
from App.tools.openvas import run_openvas_scan
from App.tools.openscap import run_openscap_audit
from App.tools.owasp import run_owasp_zap_scan


def run_pipeline_orchestration(target: str) -> dict:
    """
    Triggers and groups vulnerability engines systematically.

    Stage 1 (discovery) now runs on a pure-Python asyncio/socket scanner
    (App.tools.scanner.run_nmap_discovery) instead of the nmap binary wrapper.
    The dict contract returned by that function is unchanged
    (success / is_web_exposed / raw_output / structured_data), so stages 2-4
    only needed defensive hardening, not a rewrite.
    """
    results = {
        "nmap": "Executing...",
        "openvas": "Skipped",
        "openscap": "Skipped",
        "owasp_zap": "Skipped",
    }

    # 1. Run Nmap-equivalent Discovery Scan (pure-Python, first step)
    try:
        nmap_results = run_nmap_discovery(target)
    except Exception as exc:
        # Defensive: run_nmap_discovery already catches its own errors and
        # returns a well-formed dict, but guard against unexpected exceptions
        # (e.g. bad input types) so the pipeline never crashes outright.
        results["nmap"] = f"Discovery scan failed with an unexpected error: {exc}"
        return results

    results["nmap"] = nmap_results.get("raw_output", "No output returned.")

    # If discovery fails completely, stop execution to prevent invalid target checks
    if not nmap_results.get("success"):
        return results

    # Carry structured port data forward in case downstream engines or callers
    # want it (e.g. to target specific open ports rather than re-scanning).
    open_ports = nmap_results.get("structured_data", [])
    results["discovered_ports"] = open_ports

    # 2. Run OpenVAS Network Vulnerability Scan
    try:
        results["openvas"] = run_openvas_scan(target)
    except Exception as exc:
        results["openvas"] = f"OpenVAS scan failed: {exc}"

    # 3. Run OpenSCAP Compliance Audit Scan
    try:
        results["openscap"] = run_openscap_audit(target)
    except Exception as exc:
        results["openscap"] = f"OpenSCAP audit failed: {exc}"

    # 4. Run OWASP ZAP only if discovery detected an open web port
    if nmap_results.get("is_web_exposed"):
        # Prefer HTTPS if a TLS web port was found, otherwise fall back to HTTP.
        https_ports = {443, 8443}
        scheme = "https" if any(p["port"] in https_ports for p in open_ports) else "http"
        target_web_url = f"{scheme}://{target}"

        try:
            results["owasp_zap"] = run_owasp_zap_scan(target_web_url)
        except Exception as exc:
            results["owasp_zap"] = f"OWASP ZAP scan failed: {exc}"
    else:
        results["owasp_zap"] = "Bypassed (No web ports [80, 443, 8080, 8443, 8000, 5000] detected by discovery scan)."

    return results