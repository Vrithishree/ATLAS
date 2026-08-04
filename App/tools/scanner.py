"""
App/tools/scanner.py

Pure-Python replacement for the nmap-based scanner used by ATLAS Security Core.
No external binary dependency (no `nmap` executable, no subprocess calls).

Performs:
  - Async TCP Connect scans (asyncio.open_connection) across the top ~100 ports
  - Lightweight banner grabbing (raw socket read + HTTP HEAD probe for web ports)
  - Simple service/product fingerprinting from banners
  - Web exposure flagging for common web ports

Public API:
  run_nmap_discovery(target: str) -> dict
"""

import asyncio
import socket
from datetime import datetime, timezone

# --------------------------------------------------------------------------
# Port list: top 100 most commonly scanned TCP ports (nmap-top-100-ish set)
# --------------------------------------------------------------------------
TOP_100_PORTS = [
    7, 9, 13, 21, 22, 23, 25, 26, 37, 53, 79, 80, 81, 88, 106, 110, 111, 113,
    119, 135, 139, 143, 144, 179, 199, 389, 427, 443, 444, 445, 465, 513, 514,
    515, 543, 544, 548, 554, 587, 631, 646, 873, 990, 993, 995, 1025, 1026,
    1027, 1028, 1029, 1110, 1433, 1720, 1723, 1755, 1900, 2000, 2001, 2049,
    2121, 2717, 3000, 3128, 3306, 3389, 3986, 4899, 5000, 5009, 5051, 5060,
    5101, 5190, 5357, 5432, 5631, 5666, 5800, 5900, 6000, 6001, 6646, 7070,
    8000, 8008, 8009, 8080, 8081, 8443, 8888, 9100, 9999, 10000, 32768, 49152,
    49153, 49154, 49155, 49156, 49157,
]

WEB_PORTS = {80, 443, 8080, 8443, 8000, 5000}

# Ports where we prefer an HTTP HEAD probe over a raw banner read
HTTP_LIKE_PORTS = {80, 8080, 8000, 8008, 8081, 8888, 5000, 3000}
HTTPS_LIKE_PORTS = {443, 8443}

# Fallback service name guesses for common ports (used if banner grab fails)
COMMON_SERVICE_NAMES = {
    21: "ftp", 22: "ssh", 23: "telnet", 25: "smtp", 53: "domain",
    80: "http", 110: "pop3", 111: "rpcbind", 135: "msrpc", 139: "netbios-ssn",
    143: "imap", 389: "ldap", 443: "https", 445: "microsoft-ds",
    465: "smtps", 587: "submission", 631: "ipp", 993: "imaps", 995: "pop3s",
    1433: "ms-sql-s", 1723: "pptp", 3000: "ppp", 3306: "mysql",
    3389: "ms-wbt-server", 5000: "upnp", 5432: "postgresql", 5900: "vnc",
    6379: "redis", 8000: "http-alt", 8080: "http-proxy", 8443: "https-alt",
    9100: "jetdirect", 27017: "mongodb",
}

CONNECT_TIMEOUT = 1.5   # seconds per connection attempt
BANNER_TIMEOUT = 1.5    # seconds waiting for banner/response
MAX_CONCURRENCY = 50


async def _grab_http_banner(host: str, port: int, use_tls: bool) -> str:
    """Send a lightweight HTTP HEAD request and return the raw response text."""
    try:
        reader, writer = await asyncio.wait_for(
            asyncio.open_connection(host, port, ssl=use_tls if use_tls else None),
            timeout=CONNECT_TIMEOUT,
        )
    except Exception:
        return ""

    try:
        request = (
            f"HEAD / HTTP/1.1\r\n"
            f"Host: {host}\r\n"
            f"User-Agent: ATLAS-Security-Core/1.0\r\n"
            f"Connection: close\r\n\r\n"
        )
        writer.write(request.encode(errors="ignore"))
        await writer.drain()

        data = await asyncio.wait_for(reader.read(2048), timeout=BANNER_TIMEOUT)
        return data.decode(errors="ignore")
    except Exception:
        return ""
    finally:
        try:
            writer.close()
            await writer.wait_closed()
        except Exception:
            pass


async def _grab_raw_banner(host: str, port: int) -> str:
    """Open a TCP connection and read whatever banner the service offers unprompted."""
    try:
        reader, writer = await asyncio.wait_for(
            asyncio.open_connection(host, port), timeout=CONNECT_TIMEOUT
        )
    except Exception:
        return ""

    try:
        data = await asyncio.wait_for(reader.read(256), timeout=BANNER_TIMEOUT)
        return data.decode(errors="ignore")
    except Exception:
        # Some services (e.g. plain HTTP without a prompt) won't send anything
        # unprompted; that's fine, we just return an empty banner.
        return ""
    finally:
        try:
            writer.close()
            await writer.wait_closed()
        except Exception:
            pass


def _parse_service_from_banner(port: int, banner: str) -> dict:
    """Best-effort service/product/version extraction from a banner string."""
    service = COMMON_SERVICE_NAMES.get(port, "unknown")
    product = ""
    version = ""

    if not banner:
        return {"service": service, "product": product, "version": version}

    lower = banner.lower()

    # HTTP-style banner
    if lower.startswith("http/") or "server:" in lower:
        service = "https" if port in HTTPS_LIKE_PORTS else "http"
        for line in banner.split("\r\n"):
            if line.lower().startswith("server:"):
                server_val = line.split(":", 1)[1].strip()
                if "/" in server_val:
                    product, version = server_val.split("/", 1)
                    product = product.strip()
                    version = version.split()[0].strip()
                else:
                    product = server_val
                break

    # SSH banner, e.g. "SSH-2.0-OpenSSH_8.9p1"
    elif lower.startswith("ssh-"):
        service = "ssh"
        parts = banner.strip().split("-", 2)
        if len(parts) == 3:
            product_version = parts[2]
            if "_" in product_version:
                product, version = product_version.split("_", 1)
            else:
                product = product_version

    # FTP banner
    elif "ftp" in lower[:50]:
        service = "ftp"
        product = banner.strip().split("\r\n")[0][:80]

    # SMTP banner
    elif lower.startswith("220") and ("smtp" in lower or "mail" in lower):
        service = "smtp"
        product = banner.strip().split("\r\n")[0][:80]

    # Generic fallback: keep first line as product hint
    else:
        first_line = banner.strip().split("\r\n")[0][:80]
        if first_line:
            product = first_line

    return {"service": service, "product": product.strip(), "version": version.strip()}


async def _scan_port(host: str, port: int, semaphore: asyncio.Semaphore) -> dict | None:
    """Attempt a TCP connect scan + banner grab on a single port."""
    async with semaphore:
        try:
            reader, writer = await asyncio.wait_for(
                asyncio.open_connection(host, port), timeout=CONNECT_TIMEOUT
            )
        except (asyncio.TimeoutError, ConnectionRefusedError, OSError):
            return None

        # Port is open — close this probe connection, then grab a banner
        try:
            writer.close()
            await writer.wait_closed()
        except Exception:
            pass

        banner = ""
        if port in HTTPS_LIKE_PORTS:
            banner = await _grab_http_banner(host, port, use_tls=True)
        elif port in HTTP_LIKE_PORTS:
            banner = await _grab_http_banner(host, port, use_tls=False)
        else:
            banner = await _grab_raw_banner(host, port)

        fingerprint = _parse_service_from_banner(port, banner)

        return {
            "port": port,
            "protocol": "tcp",
            "state": "open",
            "service": fingerprint["service"],
            "product": fingerprint["product"],
            "version": fingerprint["version"],
        }


def _resolve_target(target: str) -> str | None:
    """Resolve hostname to an IP; return None if resolution fails."""
    try:
        return socket.gethostbyname(target)
    except socket.gaierror:
        return None


def _format_raw_output(target: str, resolved_ip: str, results: list, duration: float) -> str:
    lines = []
    lines.append(f"ATLAS Security Core - Async TCP Connect Scan")
    lines.append(f"Target: {target} ({resolved_ip})")
    lines.append(f"Scanned: {len(TOP_100_PORTS)} ports | Concurrency: {MAX_CONCURRENCY}")
    lines.append(f"Timestamp: {datetime.now(timezone.utc).isoformat()}")
    lines.append(f"Duration: {duration:.2f}s")
    lines.append("")

    if not results:
        lines.append("No open ports found.")
    else:
        lines.append(f"Open ports: {len(results)}")
        lines.append("-" * 60)
        lines.append(f"{'PORT':<10}{'STATE':<8}{'SERVICE':<15}{'PRODUCT/VERSION'}")
        lines.append("-" * 60)
        for r in sorted(results, key=lambda x: x["port"]):
            product_version = r["product"]
            if r["version"]:
                product_version += f" {r['version']}"
            lines.append(
                f"{r['port']:<10}{r['state']:<8}{r['service']:<15}{product_version}"
            )

    return "\n".join(lines)


async def _run_discovery_async(target: str) -> dict:
    start = asyncio.get_event_loop().time()

    resolved_ip = _resolve_target(target)
    if resolved_ip is None:
        return {
            "success": False,
            "is_web_exposed": False,
            "raw_output": f"Scan failed: could not resolve host '{target}'.",
            "structured_data": [],
        }

    semaphore = asyncio.Semaphore(MAX_CONCURRENCY)
    tasks = [_scan_port(resolved_ip, port, semaphore) for port in TOP_100_PORTS]
    scan_results = await asyncio.gather(*tasks)

    open_ports = [r for r in scan_results if r is not None]
    duration = asyncio.get_event_loop().time() - start

    is_web_exposed = any(r["port"] in WEB_PORTS for r in open_ports)
    raw_output = _format_raw_output(target, resolved_ip, open_ports, duration)

    return {
        "success": True,
        "is_web_exposed": is_web_exposed,
        "raw_output": raw_output,
        "structured_data": open_ports,
    }


def run_nmap_discovery(target: str) -> dict:
    """
    Synchronous entry point (drop-in replacement for the old nmap-based function).

    Performs an async TCP connect scan + banner grab against `target` across the
    top 100 ports, using pure Python (asyncio + socket) — no nmap binary required.

    Returns:
        {
            "success": bool,
            "is_web_exposed": bool,
            "raw_output": str,
            "structured_data": [
                {
                    "port": int,
                    "protocol": "tcp",
                    "state": "open",
                    "service": str,
                    "product": str,
                    "version": str,
                },
                ...
            ],
        }
    """
    if not target or not isinstance(target, str):
        return {
            "success": False,
            "is_web_exposed": False,
            "raw_output": "Scan failed: invalid target provided.",
            "structured_data": [],
        }

    try:
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop is not None and loop.is_running():
            # We're already inside an event loop (e.g. called from an async
            # web framework handler) — run in a fresh loop on a separate thread
            # to avoid "asyncio.run() cannot be called from a running event loop".
            import concurrent.futures

            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                future = pool.submit(asyncio.run, _run_discovery_async(target))
                return future.result()
        else:
            return asyncio.run(_run_discovery_async(target))

    except Exception as exc:
        return {
            "success": False,
            "is_web_exposed": False,
            "raw_output": f"Scan failed with error: {exc}",
            "structured_data": [],
        }


if __name__ == "__main__":
    import json
    import sys

    tgt = sys.argv[1] if len(sys.argv) > 1 else "127.0.0.1"
    result = run_nmap_discovery(tgt)
    print(json.dumps(result, indent=2))