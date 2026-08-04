import socket
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler

# 1. Vulnerable HTTP Web Server for OWASP ZAP
class VulnerableHTTPHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Intentionally missing security headers (HSTS, CSP, X-Frame-Options)
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.end_headers()
        
        # Simple vulnerable web interface
        html = """
        <!DOCTYPE html>
        <html>
        <head><title>ATLAS Local Vulnerable Testbed</title></head>
        <body>
            <h1>Internal Corporate Test Server</h1>
            <p>Status: Active</p>
            <form action="/search" method="GET">
                <input type="text" name="query" placeholder="Search...">
                <input type="submit" value="Search">
            </form>
        </body>
        </html>
        """
        self.wfile.write(html.encode("utf-8"))

    def log_message(self, format, *args):
        return # Suppress verbose console logs

def start_web_server(port=5000):
    server = HTTPServer(("127.0.0.1", port), VulnerableHTTPHandler)
    print(f"[+] HTTP Web Target listening on http://127.0.0.1:{port}")
    server.serve_forever()

# 2. Dummy TCP Port Listeners for Nmap & OpenVAS CVE Engine
def start_dummy_port_listener(port, banner_text):
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sock.bind(("127.0.0.1", port))
        sock.listen(5)
        while True:
            client, _ = sock.accept()
            try:
                client.sendall(banner_text.encode("utf-8"))
            except Exception:
                pass
            client.close()
    except Exception as e:
        print(f"[!] Port {port} skipped (requires admin or port in use): {e}")

if __name__ == "__main__":
    print("==================================================")
    print(" ATLAS Local Self-Contained Vulnerable Target Engine")
    print("==================================================")

    # Start dummy high-risk ports for OpenVAS / Nmap detection
    ports_to_mock = [
        (21, "220-VSFTPd 2.3.4 Backdoor FTP\r\n"),
        (23, "Telnet service ready\r\n"),
        (135, "MSRPC\r\n"),
        (445, "SMBv1\r\n")
    ]

    for port, banner in ports_to_mock:
        t = threading.Thread(target=start_dummy_port_listener, args=(port, banner), daemon=True)
        t.start()

    # Start primary web server target
    start_web_server(port=5000)