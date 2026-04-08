---
title: "Una red neuronal desde cero, sin frameworks"
description: "Implementar forward pass, backpropagation, ReLU, softmax y descenso de gradiente en NumPy puro para clasificar dígitos del MNIST. Por qué importa entender lo que hay debajo."
pubDate: 2026-01-22
tags: ["machine learning", "Python", "NumPy", "educativo"]
project: "neural-network-from-scratch"
projectUrl: "https://github.com/elcapo/neural-network-from-scratch"
draft: true
---

## Frameworks: cómodos, opacos

Es relativamente fácil entrenar una red neuronal hoy en día. Cuatro líneas de PyTorch o Keras y ya tienes un clasificador funcionando. El problema es que esa comodidad tiene un coste: cada vez que usas `loss.backward()`, ocurren un montón de cosas que es muy fácil dejar de cuestionar.

Este proyecto nace de un ejercicio terco: **escribir una red neuronal entera sin frameworks de deep learning**. Solo Python y NumPy. Sin autograd. Sin capas predefinidas. Si quiero gradientes, los calculo yo.

## Qué se construye

Una red feedforward de tres capas entrenada sobre MNIST (70.000 imágenes de dígitos manuscritos):

- **Capa de entrada**: 784 neuronas (28×28 píxeles aplanados).
- **Capa oculta**: 10 neuronas con activación ReLU.
- **Capa de salida**: 10 neuronas con softmax para producir probabilidades de cada dígito.

Los componentes implementados a mano son:

- Forward propagation.
- Activaciones ReLU y Softmax.
- Función de pérdida cross-entropy.
- Backpropagation completa.
- Descenso de gradiente.

Nada de magia: cada operación está escrita explícitamente y, lo más importante, **se puede leer de arriba abajo en una tarde**.

## Resultados

El modelo alcanza alrededor de un **90% de precisión en el conjunto de test** de MNIST. No es un récord, pero no es ese el objetivo: el objetivo es que esa precisión la entiendas tú, no la librería.

El repositorio incluye además matrices de confusión y visualizaciones de los pesos aprendidos por la capa oculta, donde se intuyen los "trazos" característicos de cada dígito.

## Lo que aprendes implementándolo

Hay cosas que solo se aprenden cuando las escribes. Algunas que me parecieron especialmente reveladoras:

1. **Las dimensiones importan**. Pasar de la fórmula matemática a NumPy te obliga a tener clarísimo qué es vector, qué es matriz y por qué un `.T` mal puesto rompe todo.
2. **Backpropagation no es magia**, es la regla de la cadena aplicada con disciplina. Una vez que has derivado los gradientes a mano, los frameworks dejan de parecer mágicos y empiezan a parecer útiles.
3. **El batching cambia las constantes**. Calcular el gradiente sobre un solo ejemplo es trivial; hacerlo bien sobre un batch de 64 obliga a pensar en broadcasting.
4. **El learning rate es el rey**. Con el resto del código bien, un valor mal elegido puede destruir el entrenamiento.

## Estructura del proyecto

El repo está pensado como material de estudio, así que está escrito de forma muy explícita: gestión de dependencias con `uv`, tests con `pytest`, formato y linting con `ruff`. Todo lo accesorio que normalmente estorba al aprender está atado y documentado para no distraer.

## Próximos pasos

- Añadir una segunda capa oculta y comparar resultados.
- Implementar un optimizador con momentum.
- Reemplazar MNIST por Fashion-MNIST para ver cómo se comporta el mismo modelo en un dataset más difícil.

> *Borrador en preparación. Pienso ampliar el artículo con derivaciones paso a paso de los gradientes y ejemplos visuales de qué aprende cada neurona oculta.*
