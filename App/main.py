import sys
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
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
    target: str

@app.get("/")
def health_check():
    return {"status": "ATLAS Core Online", "modules": ["Nmap", "OpenVAS", "OpenSCAP", "OWASP ZAP"]}

@app.post("/api/run-simulation")
async def execute_va_simulation(request: ScanRequest):
    try:
        # Fire the orchestrator to execute the security checks
        pipeline_data = run_pipeline_orchestration(request.target)
        
        return {
            "status": "Success",
            "target": request.target,
            "scan_data": {
                "infrastructure_ports": pipeline_data["nmap"],
                "network_vulnerabilities": pipeline_data["openvas"],
                "compliance_violations": pipeline_data["openscap"],
                "web_application_vulnerabilities": pipeline_data["owasp_zap"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")

# ==========================================
# TERMINAL EXECUTION BLOCK
# ==========================================
if __name__ == "__main__":
    # Check if a target IP/domain was passed in the terminal argument
    if len(sys.argv) > 1:
        target_argument = sys.argv[1]
        print(f"\n🚀 Starting ATLAS VA Pipeline for target: {target_argument}")
        print("=" * 60)
        
        try:
            # Execute the orchestrator synchronously
            pipeline_data = run_pipeline_orchestration(target_argument)
            
            # Format output payload
            output_payload = {
                "status": "Success",
                "target": target_argument,
                "scan_data": {
                    "infrastructure_ports": pipeline_data["nmap"],
                    "network_vulnerabilities": pipeline_data["openvas"],
                    "compliance_violations": pipeline_data["openscap"],
                    "web_application_vulnerabilities": pipeline_data["owasp_zap"]
                }
            }
            
            # Print the final result in clean, easy-to-read JSON
            print("\n✅ Scan Pipeline Complete! Results:")
            print("=" * 60)
            print(json.dumps(output_payload, indent=2))
            
        except Exception as err:
            print(f"\n❌ Pipeline failed during terminal execution: {err}")
    else:
        print("❌ Error: No target provided.")
        print("Usage: python -m app.main <target_ip_or_domain>")
        print("Example: python -m app.main 127.0.0.1")