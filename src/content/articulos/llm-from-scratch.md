---
title: "Construir un LLM desde cero, capítulo a capítulo"
description: "Implementación orientada a objetos del libro de Sebastian Raschka, escrita como código testeable en lugar de notebooks. Atención, arquitectura GPT y preentrenamiento desde primeros principios."
pubDate: 2026-01-08
tags: ["LLM", "Python", "educativo", "transformers"]
project: "llm-from-scratch"
projectUrl: "https://github.com/elcapo/llm-from-scratch"
draft: true
---

## Notebooks vs. código que quieras mantener

El libro *Build a Large Language Model (from Scratch)* de Sebastian Raschka es probablemente el mejor recurso que existe para entender cómo funciona un LLM por dentro. La pega: el material original viene en notebooks de Jupyter, que son magníficos para aprender pero incómodos para mantener, testear y reutilizar.

Este proyecto es mi recorrido del libro, **pero reescrito como código orientado a objetos** dentro de la carpeta `scratch/`. Cada concepto del libro pasa a ser una clase con tests, no una celda con `print`.

## Lo que hay implementado

Cinco capítulos completados:

1. **Procesamiento de texto**: tokenización, vocabularios, dataloaders.
2. **Mecanismos de atención**: desde la atención simplificada hasta la multi-head con causal masking.
3. **Arquitectura GPT**: bloques transformer, capas de normalización, posiciones.
4. **Preentrenamiento**: el ciclo completo de entrenamiento sobre texto sin etiquetar.
5. **Notebooks de apoyo**: dos notebooks complementarios que exploran ideas de preentrenamiento sin romper la estructura del paquete.

Quedan dos capítulos por completar: fine-tuning para clasificación y fine-tuning para seguir instrucciones.

## Por qué clases (y por qué tests)

La elección de pasar de notebook a código orientado a objetos no fue capricho. Tiene tres ventajas concretas:

- **Testabilidad**. Cada componente (tokenizer, attention head, transformer block) se puede probar aislado. Y los tests usan **valores exactos del libro** como referencia, lo cual es una forma muy efectiva de detectar regresiones cuando refactorizas.
- **Reutilización**. Una vez que tienes una clase `MultiHeadAttention`, la usas en todos los capítulos siguientes. En notebook acabas copiando y pegando.
- **Herramientas reales**. `pytest`, entornos virtuales, `requirements.txt`. El mismo flujo de trabajo que usarías en cualquier otro proyecto Python serio.

## Por qué hacerlo

Una pregunta razonable: si ya existe el libro, ¿para qué reescribirlo? Hay tres respuestas:

1. **No entiendes algo hasta que lo escribes tú**. Leer el código de Raschka y copiarlo no es lo mismo que reorganizarlo en clases coherentes. Reescribir te obliga a entender cada decisión.
2. **Tener tests cambia cómo aprendes**. Cuando un test rojo te dice exactamente en qué tensor te has equivocado, aprendes mucho más rápido que cuando intentas leer un stack trace en un notebook.
3. **Material para otras personas**. El proyecto se hizo dentro de un grupo de estudio organizado por Santi Viquez ("AI from scratch"), con una comunidad activa en Discord. Tener una versión "limpia" del código del libro era útil para más gente.

## Próximos pasos

- Completar los dos capítulos pendientes (fine-tuning para clasificación e instrucciones).
- Añadir benchmarks ligeros para ver cómo escalan las distintas piezas.
- Documentar las decisiones de diseño en un par de notas separadas.

> *Borrador en preparación. En la versión final iré incluyendo extractos de código comparando "versión notebook" y "versión clase" para ilustrar las diferencias.*
