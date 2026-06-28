---
title: "Preparar el entorno"
description: "Preparamos nuestro equipo para seguir el curso con comodidad, instalando Git, uv, Python y clonando los repositorios de referencia."
curso: "leyendo-python"
bloque: "Fundamentos del lenguaje"
orden: 0
draft: true
---

## Control de versiones

Con independencia del lenguaje de programación con el que trabajes, contar con una herramienta de control de versiones es prácticamente imprescindible. Y **Git** es, con diferencia, la más utilizada.

Gracias a **Git**, una carpeta con tus proyectos se convierte en un repositorio que conserva el historial de cambios de sus archivos. Es como si pudieras viajar en el tiempo y recuperar cualquier estado anterior del proyecto.

Además, puedes mantener distintas líneas de desarrollo mediante ramas, conocer quién realizó cada cambio y cuándo lo hizo, o comparar la evolución del proyecto entre diferentes momentos.

### Herramientas de consulta online

Cuando un repositorio mantenido con **Git** se convierte en un proyecto compartido, es normal querer compartirlo con otra gente para editarlo de forma colaborativa. Para resolver esto, existen dos herramientas básicas:

* [GitHub](https://github.com): El sitio web de repositorios de código más grande del mundo, mantenido por los autores mismos de **Git**.

* [GitLab](https://about.gitlab.com): Una alternativa a GitHub que puede ser alojada en servidores privados, o hasta en ordenadores personales.

En la práctica, puedes seguir este curso completo usando únicamente un navegador pero la experiencia no es la misma que la de clonar los repositorios en tu propio ordenador.

Además de que, al clonarlos, ganas la posibilidad de trabajar cuando no tengas conexión a internet y se facilitan enormemente las tareas de lectura, edición y ejecución paso a paso.

Por eso, te recomiendo que sigas las [instrucciones oficiales de instalación de **Git**](https://git-scm.com/downloads).

## Gestión de paquetes con `uv`

Aunque entraremos en más detalle sobre las herramientas que debes de conocer para trabajar en proyectos escritos en Python, por el momento es suficiente con que instales **uv**, que es la herramienta que usaremos para gestionar dependencias, incluída la versión específica de Python que necesita cada proyecto.

En la mayor parte de los casos, para instalar **uv** en Linux, o MacOS, o WSL, basta con ejecutar:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Si tienes problemas, sigue las [instrucciones oficiales para instalar uv](https://docs.astral.sh/uv/getting-started/installation/).

## Python

**Python** es el lenguaje de programación sobre el que gira todo el curso. A lo largo de los capítulos vamos a asumir **Python 3.12** o superior, que es la versión con la que funcionan los proyectos de referencia.

Aunque tu sistema operativo ya traiga una versión de Python instalada, es buena práctica dejar que sea **uv** quien gestione una propia, aislada del sistema, ejecutando:

```bash
uv python install 3.12
```

Así el intérprete que usemos en el curso no interfiere ni con el Python del sistema ni con el de otros proyectos que tengas en el ordenador.

## Clonar los repositorios de referencia

**Clonar** un repositorio consiste en descargar una copia local completa —código, historial de cambios y ramas— a una carpeta de tu ordenador. Para evitarte lanzar cada clonación a mano, el curso trae un pequeño script que lo hace por ti.

Desde la raíz del curso:

```bash
uv run scripts/clone_repos.py
```

El script crea la carpeta `repositorios/` y dentro clona los seis proyectos que vamos a estudiar:

| Proyecto | Origen |
| --- | --- |
| click | <https://github.com/pallets/click> |
| more-itertools | <https://github.com/more-itertools/more-itertools> |
| pendulum | <https://github.com/sdispater/pendulum> |
| python-dotenv | <https://github.com/theskumar/python-dotenv> |
| rich | <https://github.com/Textualize/rich> |
| tenacity | <https://github.com/jd/tenacity> |

Si más adelante vuelves a ejecutar el script, en lugar de clonar los repositorios desde cero, los actualiza con los últimos cambios usando:

```bash
git pull --ff-only
```

El flag `--ff-only` asegura que la actualización solo prospera si puede hacerse avanzando la rama local sin machacar cambios. Es útil por si alguna vez decides tocar las copias locales para hacer alguna prueba.
