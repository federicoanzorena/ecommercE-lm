import numpy as np
import pandas as pd
from joblib import dump
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error


def generar_dataset_sintetico(n_muestras: int = 2000, seed: int = 42) -> pd.DataFrame:
    """
    Genera datos de ventas simulados para entrenar el modelo.
    En el futuro, esta funcion se puede reemplazar por una consulta real
    a la tabla orden_items, agrupando por producto y fecha.
    """
    rng = np.random.default_rng(seed)

    dia_semana = rng.integers(0, 7, n_muestras)
    precio = rng.uniform(5000, 80000, n_muestras)
    stock_disponible = rng.integers(0, 50, n_muestras)

    # Patron simulado: mas venta en fin de semana (5, 6), menos con precio alto,
    # y la venta se limita si no hay stock suficiente.
    demanda_base = (
        10
        + (dia_semana >= 5) * 8
        - (precio / 10000)
        + rng.normal(0, 2, n_muestras)
    )
    demanda_base = np.clip(demanda_base, 0, None)
    cantidad_vendida = np.minimum(demanda_base, stock_disponible).round()

    return pd.DataFrame({
        "dia_semana": dia_semana,
        "precio": precio,
        "stock_disponible": stock_disponible,
        "cantidad_vendida": cantidad_vendida,
    })


def entrenar():
    df = generar_dataset_sintetico()

    X = df[["dia_semana", "precio", "stock_disponible"]]
    y = df["cantidad_vendida"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    modelo = RandomForestRegressor(n_estimators=100, random_state=42)
    modelo.fit(X_train, y_train)

    predicciones = modelo.predict(X_test)
    error = mean_absolute_error(y_test, predicciones)
    print(f"Error absoluto medio (MAE): {error:.2f} unidades")

    dump(modelo, "backend/ml/modelos/demanda_model.joblib")
    print("Modelo guardado en backend/ml/modelos/demanda_model.joblib")


if __name__ == "__main__":
    entrenar()