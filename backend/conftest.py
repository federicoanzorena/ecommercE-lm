"""Configuración global de pytest: variables de entorno antes de importar la app.

SEGURIDAD_SECRET_KEY: la app falla al arrancar sin ella (fail-fast).
RATELIMIT_ENABLED: desactiva el rate limiting durante los tests.
"""

import os

os.environ.setdefault("SEGURIDAD_SECRET_KEY", "clave-de-test-0123456789abcdef0123456789abcdef")
os.environ.setdefault("RATELIMIT_ENABLED", "false")
os.environ.setdefault("MERCADOPAGO_ACCESS_TOKEN", "TEST-clave-de-test")
os.environ.setdefault("MERCADOPAGO_WEBHOOK_SECRET", "secret-de-webhook-de-test")
