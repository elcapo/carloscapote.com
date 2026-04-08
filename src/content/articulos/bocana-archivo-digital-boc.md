---
title: "Bocana: liberar el Boletín Oficial de Canarias"
description: "Cómo construí un archivo digital con búsqueda avanzada para más de 115.000 disposiciones del BOC, y por qué la transparencia administrativa necesita herramientas ciudadanas."
pubDate: 2026-03-12
tags: ["transparencia", "datos abiertos", "Next.js", "búsqueda"]
project: "Bocana"
projectUrl: "https://bocana.org"
draft: true
---

## El problema: información pública, acceso privado

El Boletín Oficial de Canarias (BOC) publica a diario decretos, anuncios, convocatorias y resoluciones que afectan directamente a la vida de las personas que viven en las islas. Es información pública por mandato legal. Sin embargo, encontrar una disposición concreta entre décadas de boletines fragmentados es una tarea que solo se sostiene si tienes tiempo, paciencia y, a menudo, formación jurídica.

Bocana nace de una intuición sencilla: **lo público debería ser, también, accesible**. Centralizar el corpus completo del BOC, indexarlo a texto completo y exponerlo tras una búsqueda rápida no es un favor a la ciudadanía, es la condición mínima para que la transparencia signifique algo.

## Qué hace Bocana

Bocana es una plataforma web que reúne en un único sitio los boletines del BOC y permite consultarlos a través de una búsqueda avanzada. Sus piezas principales son:

- **Búsqueda de texto completo** sobre todas las disposiciones publicadas.
- **Organización cronológica** por boletín, con enlaces tanto al detalle indexado en Bocana como a la fuente oficial.
- **Métricas de cobertura** que muestran de un vistazo cuántas disposiciones existen por sección y por organismo emisor.
- **Página de metodología** que documenta cómo se recogen e indexan los datos, porque la transparencia de la herramienta es parte del producto.

En el momento de escribir este artículo, la sección de Anuncios supera las 115.000 entradas y la Consejería de Sanidad lidera el ranking por organismo con casi 13.000 disposiciones.

## Decisiones técnicas

Bocana está construido con Next.js y React. La elección no fue casual: necesitaba renderizado en servidor para que cada disposición tuviera una URL estable, indexable y compartible, y un frontend cómodo para iterar sobre la interfaz de búsqueda.

Algunos puntos que me parecen interesantes para un análisis a fondo:

1. **Modelo de datos**: cómo representar un boletín, una sección y una disposición de forma que la búsqueda sea rápida sin romper la trazabilidad con la fuente oficial.
2. **Indexación incremental**: el BOC se publica a diario; el pipeline tiene que ser idempotente y resistente a republicaciones.
3. **UX de búsqueda jurídica**: la mayoría de buscadores están pensados para consumo, no para investigación. Bocana intenta acercarse al segundo caso sin asustar al primero.
4. **Modo oscuro y lectura**: pequeños detalles, pero importantes cuando alguien va a pasar horas leyendo texto administrativo.

## Lo que aún queda por hacer

Bocana es un proyecto vivo. Algunas líneas de trabajo en las que me gustaría profundizar en próximos artículos:

- Alertas por palabra clave o por organismo.
- Exportación a formatos abiertos (CSV, JSON-LD) para que otras personas puedan reutilizar los datos.
- Anotación colaborativa de disposiciones por parte de profesionales del derecho y la administración.

> *Borrador en preparación. Iré ampliando este artículo con capturas, fragmentos de código y un análisis más detallado de la arquitectura.*
