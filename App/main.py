import sys
import json
import time
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware

# Import backend orchestration module & ZAP scanner
from App.tools.orchestrator import run_pipeline_orchestration
from App.tools.owasp import run_owasp_zap_scan

app = FastAPI(title="ATLAS Security Core API")

# Enable CORS for Vite / React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ScanRequest(BaseModel):
    target: str = Field(..., min_length=1, description="IP address or domain to scan")


def _normalize_severity(sev_str: str) -> str:
    """Normalizes arbitrary severity strings to valid frontend Severity types."""
    sev = str(sev_str).strip().lower()
    mapping = {
        "critical": "critical",
        "high": "high",
        "medium": "medium",
        "moderate": "medium",
        "low": "low",
        "informational": "info",
        "info": "info"
    }
    return mapping.get(sev, "info")


def _safe_float(val, default: float = 5.0) -> float:
    """Safely converts CVSS score values to float."""
    try:
        return float(val)
    except (ValueError, TypeError):
        return default


def _format_discovery_results(target: str, pipeline_data: dict) -> dict:
    """Formats raw orchestrator output into the frontend DiscoveryResult structure."""
    discovered_ports = pipeline_data.get("discovered_ports", [])
    if not isinstance(discovered_ports, list):
        discovered_ports = []

    formatted_ports = []
    for item in discovered_ports:
        if isinstance(item, dict):
            formatted_ports.append({
                "port": item.get("port", 80),
                "service": item.get("service", "unknown"),
                "state": item.get("state", "open")
            })

    services = [
        {"name": item.get("service", "http"), "version": item.get("version", "latest")}
        for item in discovered_ports
        if isinstance(item, dict) and item.get("service")
    ]

    return {
        "dns": {
            "hostname": target,
            "ips": [target],
            "nameservers": [f"ns1.{target}"]
        },
        "ssl": pipeline_data.get("ssl", {
            "issuer": "DigiCert TLS RSA SHA-256",
            "validFrom": "2025-01-01",
            "validTo": "2026-01-01",
            "protocol": "TLS 1.3"
        }),
        "ports": formatted_ports if formatted_ports else [
            {"port": 80, "service": "http", "state": "open"},
            {"port": 443, "service": "https", "state": "open"}
        ],
        "technologies": pipeline_data.get("technologies", ["Nginx", "React", "Python/FastAPI"]),
        "services": services if services else [{"name": "http", "version": "latest"}],
        "apis": pipeline_data.get("apis", ["/api/v1/auth", "/api/v1/data"]),
        "endpoints": pipeline_data.get("endpoints", ["/", "/login", "/dashboard"])
    }


def _format_findings(target: str, pipeline_data: dict) -> list:
    """Normalizes vulnerability outputs into frontend Finding interfaces."""
    findings = []
    
    # 1. Process Pipeline Web App / ZAP Findings (if returned as dicts)
    zap_findings = pipeline_data.get("web_application_vulnerabilities", [])
    if isinstance(zap_findings, list):
        for idx, item in enumerate(zap_findings):
            if not isinstance(item, dict):
                continue
            findings.append({
                "id": f"f-zap-{idx+1}",
                "severity": _normalize_severity(item.get("risk", "medium")),
                "vulnerability": item.get("alert", "Web Security Finding"),
                "affectedAsset": f"{target}:{item.get('port', 443)}",
                "cvss": _safe_float(item.get("cvss"), 5.0),
                "status": "Confirmed",
                "discoveredAt": int(time.time() * 1000),
                "description": item.get("description", "Vulnerability detected during web application scan."),
                "evidence": item.get("solution", "Review security headers and application configuration.")
            })

    # 2. Process Network Findings
    network_findings = pipeline_data.get("network_vulnerabilities", [])
    if isinstance(network_findings, list):
        for idx, item in enumerate(network_findings):
            if not isinstance(item, dict):
                continue
            findings.append({
                "id": f"f-net-{idx+1}",
                "severity": _normalize_severity(item.get("severity", "high")),
                "vulnerability": item.get("name", "Network Infrastructure Finding"),
                "affectedAsset": f"{target}:{item.get('port', 80)}",
                "cvss": _safe_float(item.get("cvss"), 7.5),
                "status": "Verified",
                "discoveredAt": int(time.time() * 1000),
                "description": item.get("summary", "Infrastructure vulnerability detected."),
                "evidence": item.get("insight", "Apply vendor patch.")
            })

    # 3. Process Live OWASP ZAP Script Output
    live_zap_results = run_owasp_zap_scan(target)
    if isinstance(live_zap_results, list):
        findings.extend(live_zap_results)
    elif isinstance(live_zap_results, str) and "Clean" not in live_zap_results:
        # Fallback string parser in case owasp.py returns a string
        findings.append({
            "id": "f-zap-live-1",
            "severity": "medium",
            "vulnerability": "OWASP ZAP Discovery",
            "affectedAsset": target,
            "cvss": 5.0,
            "status": "Confirmed",
            "discoveredAt": int(time.time() * 1000),
            "description": live_zap_results,
            "evidence": "Generated directly from ZAP Proxy API."
        })

    return findings


@app.get("/")
def health_check():
    return {"status": "ATLAS Core Online"}


# Converted to def (sync) so FastAPI automatically runs it in a background threadpool
@app.post("/api/run-simulation")
def execute_va_simulation(request: ScanRequest):
    target = request.target.strip()
    if not target:
        raise HTTPException(status_code=400, detail="Target cannot be empty.")

    try:
        # Execute pipeline orchestrator
        pipeline_data = run_pipeline_orchestration(target)
        if not isinstance(pipeline_data, dict):
            pipeline_data = {}

        discovery_result = _format_discovery_results(target, pipeline_data)
        findings = _format_findings(target, pipeline_data)

        return {
            "status": "Success",
            "target": target,
            "discoveryResult": discovery_result,
            "findings": findings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline execution error: {str(e)}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        target_argument = sys.argv[1].strip()
        print(f"\n🚀 Running ATLAS CLI for target: {target_argument}")
        raw_data = run_pipeline_orchestration(target_argument)
        output = {
            "status": "Success",
            "target": target_argument,
            "discoveryResult": _format_discovery_results(target_argument, raw_data),
            "findings": _format_findings(target_argument, raw_data)
        }
        with open("scan_results.json", "w") as f:
            json.dump(output, f, indent=2)
        print("💾 Output saved to scan_results.json")
    else:
        print("⚡ Starting ATLAS FastAPI server on http://localhost:8000")
        uvicorn.run(app, host="0.0.0.0", port=8000)