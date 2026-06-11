import ssl
import socket
from django.core.mail.backends.smtp import EmailBackend as DjangoEmailBackend

# Save original getaddrinfo
_orig_getaddrinfo = socket.getaddrinfo

def _ipv4_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    # Force IPv4 (socket.AF_INET) for SMTP connections
    return _orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)

class UnverifiedSMTPEmailBackend(DjangoEmailBackend):
    def open(self):
        # Temporarily patch socket.getaddrinfo to force IPv4 for SMTP connections on Render
        socket.getaddrinfo = _ipv4_getaddrinfo
        try:
            return super().open()
        finally:
            socket.getaddrinfo = _orig_getaddrinfo

    @property
    def ssl_context(self):
        # Create an SSL context that bypasses hostname and certificate verification
        context = ssl._create_unverified_context()
        return context
