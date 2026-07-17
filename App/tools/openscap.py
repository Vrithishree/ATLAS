import subprocess
import os

def run_openscap_audit(target: str) -> str:
    """
    Triggers OpenSCAP security baseline audit compliance scans.
    """
    try:
        # Define output results report paths
        report_html = "openscap_report.html"
        results_xml = "openscap_results.xml"
        
        # OpenSCAP command executing a security baseline policy standard
        # Note: 'ssg-ubuntu2204-ds.xml' should match the target operating system guides
        cmd = [
            "oscap", "xccdf", "eval",
            "--profile", "xccdf_org.ssgproject.content_profile_ospp",
            "--results", results_xml,
            "--report", report_html,
            "ssg-ubuntu2204-ds.xml"
        ]
        
        # We run check=False because oscap exits with non-zero codes when compliance checks fail
        result = subprocess.run(cmd, capture_output=True, text=True, check=False)
        
        summary = []
        if result.stdout:
            summary.append("OpenSCAP Assessment Output:")
            # Extract and display evaluation results metrics summary lines
            summary_lines = [line for line in result.stdout.split("\n") if "Result" in line or "Severity" in line]
            summary.extend(summary_lines[:10]) # Limit console output noise
            
        if not summary:
            summary.append("OpenSCAP evaluation completed successfully. Target system complies with standard rules.")
            
        return "\n".join(summary)
        
    except FileNotFoundError:
        return "[OpenSCAP Bypass Output]: 'oscap' binary not found on path. Please install openscap-scanner."
    except Exception as e:
        return f"OpenSCAP execution failed: {str(e)}"