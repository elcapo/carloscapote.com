---
title: "Malcolm: un proxy transparente para ver qué le decimos a los LLMs"
description: "Construí un proxy de monitorización para APIs de LLM que captura cada petición, traduce entre formatos OpenAI y Anthropic y deja todo registrado en SQLite para inspeccionarlo después."
pubDate: 2026-02-28
tags: ["LLM", "Python", "observabilidad", "herramientas"]
project: "Malcolm"
projectUrl: "https://github.com/malcolm-proxy/malcolm"
draft: true
---

## La caja negra de los agentes

Cuando empiezas a usar herramientas como Claude Code, OpenCode o cualquier agente que te ayude a programar, tarde o temprano aparece la pregunta incómoda: **¿qué está enviando exactamente al modelo?**. Los prompts del sistema, la lista de tools, los fragmentos de archivos, la conversación previa, los recortes y resúmenes... todo eso vive en una caja negra que la mayoría de los clientes no exponen.

Malcolm nace de la necesidad de abrir esa caja sin tener que parchear cada cliente. Es un proxy HTTP que se coloca entre tu cliente favorito y el backend del modelo, registra todo lo que pasa en ambas direcciones (incluyendo respuestas en streaming) y te ofrece una TUI para revisarlo con calma.

## Qué hace Malcolm

- **Proxy transparente**: acepta peticiones en cualquier formato HTTP y las reenvía al backend que tú configures, gestionando claves API si quieres.
- **Captura completa**: cada petición y cada respuesta se almacena en SQLite, incluyendo los eventos de streaming reconstruidos.
- **TUI con tres niveles**: Peticiones → Mensajes → Detalle del mensaje, con resaltado de JSON y atajos de teclado para moverse rápido.
- **Traducción de protocolo**: con `MALCOLM_TRANSLATE` puedes hacer hablar a un cliente OpenAI con un backend Anthropic (o al revés). Malcolm reescribe rutas y traduce los eventos del stream al vuelo.
- **Modo "ghostkey"**: ofusca claves y secretos antes de que crucen al backend, útil cuando estás depurando contra servicios de terceros.

## Por qué SQLite y no algo más sofisticado

Una de las decisiones que me gusta de Malcolm es que la TUI lee directamente del SQLite. Eso significa que puedes inspeccionar las conversaciones aunque el proxy no esté corriendo, mover el archivo a otra máquina, o abrirlo con tus propias queries si quieres hacer análisis en lote. La herramienta no se interpone entre tú y tus datos.

## Casos de uso reales

1. **Debug de agentes de programación**: ver exactamente qué tools se le ofrecen al modelo en cada turno y qué argumentos le devuelve.
2. **Optimización de prompts**: medir cuántos tokens se gastan en boilerplate frente a en contenido útil.
3. **Auditoría de privacidad**: comprobar si una herramienta está enviando algo que no debería.
4. **Compatibilidad cruzada**: probar un cliente diseñado para una API contra un proveedor distinto, sin tocar el código del cliente.

## Lo que viene

Malcolm está en desarrollo temprano y la lista de cosas pendientes es más larga que la de cosas hechas. Algunas líneas que me interesan:

- Filtros y búsqueda dentro de la TUI.
- Exportación de conversaciones a formatos compatibles con datasets de evaluación.
- Hooks para inyectar transformaciones (redacción de PII, recorte de contexto, etc.).

> *Borrador en preparación. En la versión final del artículo incluiré un walkthrough completo, capturas de la TUI y un caso de estudio analizando una sesión real de Claude Code.*
