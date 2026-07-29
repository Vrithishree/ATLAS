import sys
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from App.tools.orchestrator import run_pipeline_orchestration
 
app = FastAPI(title="ATLAS Security Core - Multi-Engine API")
 
# Configure CORS so your teammate's separate frontend folder can talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
 
class ScanRequest(BaseModel):
    target: str = Field(..., min_length=1, description="IP address or hostname to scan")
 
 
def _build_scan_payload(target: str, pipeline_data: dict) -> dict:
    """
    Shared formatter for both the API and CLI entrypoints, so the two
    stay in sync as pipeline_data's shape evolves.
    """
    return {
        "status": "Success",
        "target": target,
        "scan_data": {
            "infrastructure_ports": pipeline_data.get("nmap"),
            "network_vulnerabilities": pipeline_data.get("openvas"),
            "compliance_violations": pipeline_data.get("openscap"),
            "web_application_vulnerabilities": pipeline_data.get("owasp_zap"),
            # New in the pure-Python scanner: structured port/service data
            # (list of {port, protocol, state, service, product, version})
            "discovered_ports": pipeline_data.get("discovered_ports", []),
        },
    }
 
 
@app.get("/")
def health_check():
    return {
        "status": "ATLAS Core Online",
        "modules": ["Nmap (pure-Python asyncio scanner)", "OpenVAS", "OpenSCAP", "OWASP ZAP"],
    }
 
 
@app.post("/api/run-simulation")
async def execute_va_simulation(request: ScanRequest):
    target = request.target.strip()
    if not target:
        raise HTTPException(status_code=400, detail="Target must not be empty.")
 
    try:
        # Fire the orchestrator to execute the security checks
        pipeline_data = run_pipeline_orchestration(target)
        return _build_scan_payload(target, pipeline_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")
 
 
# ==========================================
# TERMINAL EXECUTION BLOCK
# ==========================================
if __name__ == "__main__":
    # Check if a target IP/domain was passed in the terminal argument
    if len(sys.argv) > 1:
        target_argument = sys.argv[1].strip()
 
        if not target_argument:
            print("❌ Error: Target argument was empty.")
            sys.exit(1)
 
        print(f"\n🚀 Starting ATLAS VA Pipeline for target: {target_argument}")
        print("=" * 60)
 
        try:
            # Execute the orchestrator synchronously
            pipeline_data = run_pipeline_orchestration(target_argument)
 
            # Format output payload (shared with the API route)
            output_payload = _build_scan_payload(target_argument, pipeline_data)
 
            # Print the final result in clean, easy-to-read JSON
            print("\n✅ Scan Pipeline Complete! Results:")
            print("=" * 60)
            print(json.dumps(output_payload, indent=2))
 
            # Save final results to scan_results.json
            with open("scan_results.json", "w") as f:
                json.dump(output_payload, f, indent=2)
            print("💾 Results saved to scan_results.json")
 
        except Exception as err:
            print(f"\n❌ Pipeline failed during terminal execution: {err}")
    else:
        print("❌ Error: No target provided.")
        print("Usage: python -m app.main <target_ip_or_domain>")
        print("Example: python -m app.main 127.0.0.1")
