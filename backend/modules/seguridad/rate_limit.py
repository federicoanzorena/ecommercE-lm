"""Rate limiting del módulo de seguridad.

Límites por IP aplicados a los endpoints de autenticación.
Storage en memoria: válido para una instancia. Para multi-worker usar Redis.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
