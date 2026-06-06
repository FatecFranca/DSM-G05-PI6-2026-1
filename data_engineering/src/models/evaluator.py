"""Módulo de avaliação de modelos.

Implementa funções de métricas para regressão e classificação,
além de funções auxiliares de visualização.
"""

from typing import Any, Dict, List, Optional

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)


def evaluate_regression(
    y_true: np.ndarray,
    y_pred: np.ndarray,
) -> Dict[str, float]:
    """Calcula métricas de avaliação para modelos de regressão.

    Métricas calculadas:
    - MAE (Mean Absolute Error)
    - RMSE (Root Mean Squared Error)
    - MAPE (Mean Absolute Percentage Error)
    - R² (Coeficiente de determinação)

    Args:
        y_true: Valores reais (n_samples,).
        y_pred: Valores previstos (n_samples,).

    Returns:
        Dicionário com as métricas {'mae', 'rmse', 'mape', 'r2'}.
    """
    mae = mean_absolute_error(y_true, y_pred)
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    r2 = r2_score(y_true, y_pred)

    # MAPE — evitar divisão por zero
    mask = y_true != 0
    if mask.sum() > 0:
        mape = float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100)
    else:
        mape = float("inf")

    return {
        "mae": float(mae),
        "rmse": rmse,
        "mape": mape,
        "r2": float(r2),
    }


def evaluate_classification(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    labels: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Calcula métricas de avaliação para modelos de classificação.

    Métricas calculadas:
    - Accuracy
    - F1-score (macro)
    - Classification Report completo
    - Confusion Matrix

    Args:
        y_true: Labels reais (n_samples,).
        y_pred: Labels previstos (n_samples,).
        labels: Nomes das classes para o relatório.

    Returns:
        Dicionário com métricas {'accuracy', 'f1_macro', 'report', 'confusion_matrix'}.
    """
    target_names = labels or ["ruim", "regular", "bom"]
    class_labels = list(range(len(target_names)))

    acc = accuracy_score(y_true, y_pred)
    f1_macro = f1_score(
        y_true, y_pred, average="macro", labels=class_labels, zero_division=0
    )
    report = classification_report(
        y_true,
        y_pred,
        labels=class_labels,
        target_names=target_names,
        zero_division=0,
    )
    cm = confusion_matrix(y_true, y_pred, labels=class_labels)

    return {
        "accuracy": float(acc),
        "f1_macro": float(f1_macro),
        "report": report,
        "confusion_matrix": cm.tolist(),
    }


def plot_predictions_vs_actual(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    title: str = "Previsão vs Real",
    save_path: Optional[str] = None,
) -> None:
    """Gera gráfico de previsão vs valores reais.

    Args:
        y_true: Valores reais.
        y_pred: Valores previstos.
        title: Título do gráfico.
        save_path: Caminho para salvar a figura. Se None, mostra interativamente.
    """
    try:
        import matplotlib.pyplot as plt
    except ImportError:
        print("matplotlib não instalado. Pule a visualização.")
        return

    fig, ax = plt.subplots(figsize=(12, 6))
    ax.plot(y_true, label="Real", marker="o", linewidth=1.5)
    ax.plot(y_pred, label="Previsto", marker="x", linewidth=1.5, linestyle="--")
    ax.set_title(title)
    ax.set_xlabel("Amostra")
    ax.set_ylabel("Preço (R$/kg)")
    ax.legend()
    ax.grid(True, alpha=0.3)
    plt.tight_layout()

    if save_path:
        fig.savefig(save_path, dpi=150)
        plt.close(fig)
    else:
        plt.show()


def plot_confusion_matrix(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    labels: Optional[List[str]] = None,
    title: str = "Matriz de Confusão",
    save_path: Optional[str] = None,
) -> None:
    """Gera um heatmap da confusion matrix.

    Args:
        y_true: Labels reais.
        y_pred: Labels previstos.
        labels: Nomes das classes.
        title: Título do gráfico.
        save_path: Caminho para salvar. Se None, mostra interativamente.
    """
    try:
        import matplotlib.pyplot as plt
        import seaborn as sns
    except ImportError:
        print("matplotlib/seaborn não instalado. Pule a visualização.")
        return

    target_names = labels or ["ruim", "regular", "bom"]
    cm = confusion_matrix(y_true, y_pred)

    fig, ax = plt.subplots(figsize=(8, 6))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=target_names,
        yticklabels=target_names,
        ax=ax,
    )
    ax.set_title(title)
    ax.set_xlabel("Previsto")
    ax.set_ylabel("Real")
    plt.tight_layout()

    if save_path:
        fig.savefig(save_path, dpi=150)
        plt.close(fig)
    else:
        plt.show()
