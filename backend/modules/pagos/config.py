"""
Configuración del módulo de pagos (Mercado Pago).
Los valores se leen de variables de entorno (o un archivo .env) con prefijo
MERCADOPAGO_, nunca hardcodeados en el código.
"""

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class ConfiguracionMercadoPago(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="MERCADOPAGO_", env_file=".env", extra="ignore"
    )

    # Token de la aplicación en Mercado Pago (TEST o PROD). OBLIGATORIO.
    access_token: str | None = None
    # Clave secreta del webhook, generada en el panel al configurar la URL.
    webhook_secret: str | None = None

    @model_validator(mode="after")
    def _validar_credenciales(self):
        if not self.access_token:
            raise RuntimeError("MERCADOPAGO_ACCESS_TOKEN no está definida.")
        if not self.webhook_secret:
            raise RuntimeError("MERCADOPAGO_WEBHOOK_SECRET no está definida.")
        return self


configuracion_mp = ConfiguracionMercadoPago()
