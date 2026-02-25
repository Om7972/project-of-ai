from slowapi import Limiter
from slowapi.util import get_remote_address

# Initialize rate limiter
# In a hospital environment, we typically allow higher limits for internal IPs,
# but for the public API, we restrict to prevent DDoS.

limiter = Limiter(key_func=get_remote_address)
