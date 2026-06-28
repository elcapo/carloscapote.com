---
title: "Cómo leer código"
description: "Recomendaciones para acercarte por primera vez al código fuente de un programa sin agobios."
curso: "leyendo-python"
bloque: "Fundamentos del lenguaje"
orden: 1
draft: true
---

## Cómo aproximarse a un repositorio

Hoy en día el código fuente de cualquier programa que se precie vive en repositorios con control de versiones. Un repositorio es una carpeta que puede contener archivos y más carpetas dentro. Y el control de versiones es un sistema que permite llevar control de los cambios por los que pasa cada fichero.

El sistema de control de cambios más popular hoy en día es, sin duda, **Git**. Y lo mejor que puedes hacer para familiarizarte rápido con él, si aún no lo conocías, es abrir un repositorio y explorarlo. Verás que se parece mucho a un explorador de archivos.

### Saber cómo está organizado

Ya sabes de qué va el proyecto; ahora toca orientarte dentro de él. Un repositorio
Python moderno suele seguir un esquema parecido a este, tomado de
[click](https://github.com/pallets/click):

```
click/
├── README.md              # presentación e instrucciones básicas
├── LICENSE.txt            # condiciones de uso, reproducción y copia
├── pyproject.toml         # metadatos, dependencias y herramientas
├── src/click/             # carpeta con el código fuente del paquete
│   ├── __init__.py        # métodos expuestos
│   ├── core.py            # módulos del paquete
│   └── _utils.py          # archivos internos identificados con un guion bajo
├── tests/                 # casos de uso y contratos
├── examples/              # pequeñas recetas de código listas para ejecutar
└── docs/                  # documentación
```

#### Introducción

Cuando veas por primera vez el código fuente de un programa que no conocías previamente, en una primera lectura rápida tus ojos deberían de empezar por buscar un archivo **README.md**. En condiciones normales, ahí encontrarás un resumen explicando en qué consiste el proyecto y algunas instrucciones sobre cómo instalarlo y cómo ponerlo en marcha.

> **Ejemplo**: [click/README.md](https://github.com/pallets/click/blob/b2e30a175449cfda909ee4fbf4a29a6a071cad53/README.md?plain=1#L5-L8)
>
> Click es un paquete de Python para crear interfaces de línea de comandos atractivas de forma modular, con el mínimo código necesario. Es el "Kit de Creación de Interfaces de Línea de Comandos". Es altamente configurable, pero incluye configuraciones predeterminadas prácticas.

#### Licencia

La licencia es un contrato legal del equipo de desarrollo de una aplicación con el resto del mundo. En el caso de los repositorios que usamos como referencia en este curso, todos son de _código libre_, lo que en pocas palabras significa que puedes copiar esos programas, modificarlos y distribuir copias estén éstas modificadas, o no.

> **Ejemplo**: [click/LICENSE.txt](https://github.com/pallets/click/blob/b2e30a175449cfda909ee4fbf4a29a6a071cad53/LICENSE.txt#L3-L5)
>
> Se permite la redistribución y el uso en formato fuente y binario, con o sin modificaciones.

#### Código fuente

El código fuente es el conjunto de archivos con código Python. Lo normal es que consista en archivos con extensión **.py**. Dentro de ese conjunto de archivos podemos distinguir tres tipos según el nombre que tengan.

* En primer lugar están los módulos, que son los archivos cuyo nombre empieza por una letra (ej. [core.py](https://github.com/pallets/click/blob/b2e30a175449cfda909ee4fbf4a29a6a071cad53/src/click/core.py)). Estos son los archivos "normales": contienen código que escribes para que tu programa haga su trabajo y puedes importarlos o ejecutarlos directamente cuando lo necesites.

* Junto a ellos existen otros dos tipos que se reconocen por empezar con guiones bajos. Los que comienzan con un guión bajo (ej. [_utils.py](https://github.com/pallets/click/blob/b2e30a175449cfda909ee4fbf4a29a6a071cad53/src/click/_utils.py)) son archivos "internos": su autor indica con ese prefijo que están pensados para usarse dentro del paquete y no forman parte de la interfaz pública que se espera que uses desde fuera.

* Por último, los archivos que empiezan con dos guiones bajos (ej. [\_\_init\_\_.py](https://github.com/pallets/click/blob/b2e30a175449cfda909ee4fbf4a29a6a071cad53/src/click/__init__.py)) tienen un significado especial para el propio Python y el lenguaje los reserva para funciones concretas, por ejemplo para marcar que una carpeta es un paquete o para definir comportamientos de inicialización.

La ubicación del código fuente varía. Lo más habitual es encontrarlo en **src/\<paquete\>/** aunque en muchos proyectos está directamente en **\<paquete\>/** (ej. [rich](https://github.com/Textualize/rich)). También es habitual encontrar repositorios más maduros que siguen convenciones que ya no se usan tanto, como **lib/\<paquete\>/** pero que antaño fueron estándar (ej. [ansible](https://github.com/ansible/ansible)).

#### Dependencias

Las dependencias son paquetes en los que se apoya tu programa para funcionar. En un proyecto Python moderno viven declaradas en el archivo **pyproject.toml** que además reúne metadatos como el nombre, la versión o la licencia.

Dentro de ese archivo podemos distinguir tres tipos de dependencias.

* En primer lugar están las de producción, que necesita cualquiera que instale el paquete. Click casi no las usa: únicamente **colorama** y solo en Windows. [pendulum](https://github.com/python-pendulum/pendulum/blob/b99bd1468b5562f045c90d851c4fab0072b26df8/pyproject.toml), en cambio, declara **python-dateutil** y **tzdata** mientras que [more-itertools](https://github.com/more-itertools/more-itertools/blob/5d946b3590bfe92f1465c1b9b9830dd434745c84/pyproject.toml) no declara ninguna.

    > **Ejemplo**: [click/pyproject.toml](https://github.com/pallets/click/blob/b2e30a175449cfda909ee4fbf4a29a6a071cad53/pyproject.toml#L16-L19)

    ```toml
    requires-python = ">=3.10"
    dependencies = [
        "colorama; platform_system == 'Windows'",
    ]
    ```

* Junto a ellas existen las opcionales, que se instalan solo para quien las pide expresamente. [python-dotenv](https://github.com/theskumar/python-dotenv/blob/main/pyproject.toml) ofrece **click** a través del extra `cli` y [rich](https://github.com/Textualize/rich/blob/main/pyproject.toml) ofrece **ipywidgets** a través del extra `jupyter`. Así el paquete base se mantiene ligero y cada quien añade solo lo que use.

    > **Ejemplo**: [python-dotenv/pyproject.toml](https://github.com/theskumar/python-dotenv/blob/36004e0e34be7665ff2b11a8a4005144f76f176d/pyproject.toml#L46-L49)

    ```toml
    [project.optional-dependencies]
    cli = [
        "click>=5.0",
    ]
    ```

* Por último, las de desarrollo solo las necesita quien trabaja en el proyecto: tests, documentación, comprobación de tipos, formato, etc. click las agrupa en **[dependency-groups]**, rich las pone en **[tool.poetry.dev-dependencies]**

    > **Ejemplo**: [click/pyproject.toml](https://github.com/pallets/click/blob/b2e30a175449cfda909ee4fbf4a29a6a071cad53/pyproject.toml#L28-L40)

    ```toml
    [dependency-groups]
    dev = [
        "ruff",
        "tox",
        "tox-uv",
    ]
    docs = [
        "myst-parser",
        "pallets-sphinx-themes",
        "sphinx",
        "sphinx-tabs",
        "sphinxcontrib-log-cabinet",
    ]
    ```

También es posible que encuentres las dependencias en ficheros **requirements.txt**, sobre todo en los proyectos más antiguos. Cuando un proyecto que usa este sistema quiere separar dependencias de producción y desarrollo, normalmente las encontrarás en varios ficheros. [more-itertools](https://github.com/more-itertools/more-itertools/tree/5d946b3590bfe92f1465c1b9b9830dd434745c84/requirements) las reparte en varios archivos dentro de una carpeta y [python-dotenv](https://github.com/theskumar/python-dotenv/blob/main/requirements.txt) las lista en un único fichero.

> **Ejemplo**: [more-itertools/requirements/testing.txt](https://github.com/more-itertools/more-itertools/blob/5d946b3590bfe92f1465c1b9b9830dd434745c84/requirements/testing.txt)

```
coverage
ruff
```

Además, los ficheros de dependencias **.txt** pueden usarse para agrupar otras dependencias.

> **Ejemplo**: [more-itertools/requirements/development.txt](https://github.com/more-itertools/more-itertools/blob/5d946b3590bfe92f1465c1b9b9830dd434745c84/requirements/development.txt)

```
--requirement testing.txt
--requirement typechecks.txt
--requirement ../docs/requirements.txt
--requirement packaging.txt
```

Junto a las dependencias, **pyproject.toml** suele indicar qué versión de Python hace falta.

> **Ejemplo**: [click/pyproject.toml](https://github.com/pallets/click/blob/b2e30a175449cfda909ee4fbf4a29a6a071cad53/pyproject.toml#L16)

```toml
requires-python = ">=3.10"
```

Por último, muchos repositorios incluyen un fichero de bloqueo: **uv.lock** en click o **poetry.lock** en rich y pendulum. Su utilidad es fijar versiones exactas de todas las dependencias para que un mismo entorno pueda reproducirse de forma fiable, tanto en desarrollo como en integración continua y, en el caso de las aplicaciones, también en producción.

> **Ejemplo**: [click/uv.lock](https://github.com/pallets/click/blob/b2e30a175449cfda909ee4fbf4a29a6a071cad53/uv.lock#L10-L17)

```toml
[[package]]
name = "alabaster"
version = "1.0.0"
source = { registry = "https://pypi.org/simple" }
sdist = { url = "https://files.pythonhosted.org/packages/a6/f8/d9c74d0daf3f742840fd818d69cfae176fa332022fd44e3469487d5a9420/alabaster-1.0.0.tar.gz", hash = "sha256:c00dca57bca26fa62a6d7d0a9fcce65f3e026e9bfe33e9c538fd3fbb2144fd9e", size = 24210, upload-time = "2024-07-26T18:15:03.762Z" }
wheels = [
    { url = "https://files.pythonhosted.org/packages/7e/b3/6b4067be973ae96ba0d615946e314c5ae35f9f993eca561b356540bb0c2b/alabaster-1.0.0-py3-none-any.whl", hash = "sha256:fc6786402dc3fcb2de3cabd5fe455a2db534b371124f1f21de8731783dec828b", size = 13929, upload-time = "2024-07-26T18:15:02.05Z" },
]
```

#### Pruebas automatizadas

Las pruebas automatizadas, o tests, son pequeños programas que usan tu proyecto para asegurarse de que funciona correctamente. Están optimizados para poder ejecutarse muchos de ellos en poco tiempo informando de forma clara de posibles errores.

La ubicación más normal para estas pruebas es **tests/** y lo que encontrarás dentro son archivos con código Python, normalmente con nombres con el prefijo **test_** añadido tanto al nombre de los archivos como a cada una de las pruebas que implementan.

> **Ejemplo**: [click/tests/test_basic.py](https://github.com/pallets/click/blob/b2e30a175449cfda909ee4fbf4a29a6a071cad53/tests/test_basic.py#L13-L29)

```python
def test_basic_functionality(runner):
    @click.command()
    def cli():
        """Hello World!"""
        click.echo("I EXECUTED")

    result = runner.invoke(cli, ["--help"])
    assert not result.exception
    assert "Hello World!" in result.output
    assert "Show this message and exit." in result.output
    assert result.exit_code == 0
    assert "I EXECUTED" not in result.output

    result = runner.invoke(cli, [])
    assert not result.exception
    assert "I EXECUTED" in result.output
    assert result.exit_code == 0
```