"""
Configuración del módulo de seguridad.
Todos los valores se leen de variables de entorno (o un archivo .env),
para que cada proyecto que integre el módulo defina los suyos sin tocar código.
"""

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Clave de desarrollo hardcodeada histórica. Si se detecta esta, se rechaza.
CLAVE_DESARROLLO_CONOCIDA = "clave-de-desarrollo-cambiar-en-produccion"


class ConfiguracionSeguridad(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="SEGURIDAD_", env_file=".env", extra="ignore")

    # Clave secreta para firmar los JWT. OBLIGATORIA en todos los entornos.
    # Se genera con: openssl rand -hex 32
    secret_key: str | None = None
    algoritmo_jwt: str = "HS256"

    # Duración de los tokens
    minutos_expiracion_access_token: int = 15
    dias_expiracion_refresh_token: int = 7
    horas_expiracion_token_verificacion: int = 24

    # Reglas de contraseña
    longitud_minima_password: int = 8
    longitud_maxima_password: int = 72

    # Refresh token en cookie HttpOnly
    cookie_refresh: bool = True
    cookie_secure: bool = True
    cookie_samesite: str = "none"

    # Emisor y audiencia de los JWT
    jwt_issuer: str = "ecommerce-api"
    jwt_audience: str = "ecommerce-frontend"

    # Email SMTP
    smtp_host: str = "localhost"
    smtp_port: int = 587
    smtp_usuario: str = ""
    smtp_password: str = ""
    smtp_usar_tls: bool = True
    email_remitente: str = "no-responder@seguridad.dev"
    frontend_url: str = "http://localhost:5173"

    @model_validator(mode="after")
    def _validar_secret_key(self):
        if not self.secret_key:
            raise RuntimeError(
                "SEGURIDAD_SECRET_KEY no está definida. Generala con: openssl rand -hex 32"
            )
        if self.secret_key == CLAVE_DESARROLLO_CONOCIDA:
            raise RuntimeError(
                "SEGURIDAD_SECRET_KEY tiene la clave de desarrollo conocida. "
                "Generá una nueva con: openssl rand -hex 32"
            )
        if len(self.secret_key) < 32:
            raise RuntimeError("SEGURIDAD_SECRET_KEY debe tener al menos 32 caracteres")
        return self


configuracion = ConfiguracionSeguridad()
