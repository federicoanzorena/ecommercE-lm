# Modulo de Machine Learning - Prediccion de Demanda

## Que hace este modulo

Predice la **cantidad demandada** de un producto en un dia dado, usando tres features:
- Dia de la semana (0 = lunes, 6 = domingo)
- Precio del producto
- Stock disponible

El modulo tiene dos partes: entrenamiento del modelo y endpoint de inferencia.

## Pipeline

```
Entrenamiento                          Inferencia
(train_demanda.py)                     (modules/prediccion/)

Dataset sintetico                      Request HTTP
       │                                    │
       ▼                                    ▼
RandomForestRegressor                 Cargar modelo serializado
(100 arboles)                         (joblib.load)
       │                                    │
       ▼                                    ▼
Serializar con joblib                 modelo.predict(entrada)
       │                                    │
       ▼                                    ▼
demanda_model.joblib                  Response: cantidad_estimada
```

## Algoritmo: RandomForestRegressor

Se uso `RandomForestRegressor` de scikit-learn por estas razones:

- **Robustez:** Combina multiples arboles de decision, lo que reduce overfitting comparado con un solo arbol
- **No necesita escalado:** A diferencia de regresion lineal o SVM, no requiere normalizar los features
- **Interpretabilidad:** Permite inspectar la importancia de cada feature
- **Rendimiento:** Para un dataset de 2000 muestras con 3 features, es eficiente en tiempo de entrenamiento y prediccion

Configuracion: `n_estimators=100`, `random_state=42` (reproducibilidad).

## Dataset Sintetico

**Archivo:** `backend/ml/train_demanda.py:9-37`

Se genera un dataset sintetico de 2000 muestras porque todavia no hay historial de ventas real suficiente. El dataset simula patrones de demanda realistas:

### Patron simulado

```python
demanda_base = 10 + (dia_semana >= 5) * 8 - (precio / 10000) + ruido
cantidad_vendida = min(demanda_base, stock_disponible)
```

- **Mas venta en finde semana:** Los dias 5 y 6 (sabado y domingo) suman 8 unidades de demanda base
- **Menos venta con precio alto:** Cada $10.000 de precio reduce la demanda en 1 unidad
- **Ruido aleatorio:** `normal(0, 2)` para simular variabilidad real
- **Tope por stock:** La venta nunca puede superar el stock disponible
- **Piso en 0:** La demanda base se clipa a 0 minimo (no hay demanda negativa)

### Justificacion

En un escenario real, este dataset se reemplazaria por una consulta agrupada a la tabla `orden_items`, calculando vendidos por producto y fecha. El patron simulado replica los patrones tipicos de un e-commerce: mas actividad en finde semana, sensibilidad al precio, y limite de stock.

## Endpoint de Inferencia

**Ruta:** `POST /api/v1/prediccion/demanda`

**Request:**
```json
{
  "dia_semana": 5,
  "precio": 25000.0,
  "stock_disponible": 30
}
```

**Response:**
```json
{
  "cantidad_estimada": 14.5
}
```

**Patron Singleton:** El servicio usa un singleton porque cargar el modelo de disco es una operacion costosa. Se hace una vez al primer request y se reutiliza en todos los posteriores.

```python
_service_singleton: PrediccionService | None = None

def get_prediccion_service() -> PrediccionService:
    global _service_singleton
    if _service_singleton is None:
        _service_singleton = PrediccionService()
    return _service_singleton
```

## Metricas de Evaluacion

El script de entrenamiento imprime el **MAE (Mean Absolute Error)** en el set de test (20% del dataset). El MAE indica cuantas unidades de error promedio tiene la prediccion. Un MAE bajo indica que el modelo predice con precision razonable dentro del rango de valores del dataset sintetico.

## Como Entrenar

```bash
python -m backend.ml.train_demanda
```

Salida esperada:
```
Error absoluto medio (MAE): X.XX unidades
Modelo guardado en backend/ml/modelos/demanda_model.joblib
```

## Archivos

```
backend/ml/
  train_demanda.py          # Script de entrenamiento
  modelos/
    demanda_model.joblib     # Modelo serializado (generado por train)
```

## Dependencias

- scikit-learn - RandomForestRegressor, train_test_split, mean_absolute_error
- joblib - Serializacion del modelo
- pandas - DataFrame para el dataset
- numpy - Generacion de datos sinteticos

## Futuras Mejoras

1. **Dataset real:** Reemplazar el generador sintetico por una consulta a `orden_items` agrupada por producto y fecha
2. **Mas features:** Agregar estacionalidad, promociones, dia del mes, etc.
3. **Exportar modelo del API:** Endpoint para re-entrenar el modelo con datos actualizados
4. **Validacion cruzada:** Usar K-Fold CV en vez de un solo train/test split
5. **Comparar modelos:** Probar GradientBoosting, XGBoost, o redes neuronales
