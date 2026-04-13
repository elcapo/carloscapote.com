# Guía de estilo

Éste es un blog técnico que trata temas en profundidad pero tratando de mantener siempre un tono legible y de acercar las cuestiones a los lectores menos técnicos.

Esta pequeña guía recoge algunos de nuestros esfuerzos para conseguirlo.

## Evita acrónimos

En lugar de:

> Exploro la técnica de la inferencia capa por capa, con precarga en RAM mediante ventanas deslizantes para correr modelos enormes en GPUs de andar por casa.

Considera:

> Exploro la técnica de la inferencia capa por capa, con precarga en memoria mediante ventanas deslizantes para correr modelos enormes en hardware de andar por casa.

## Usa anotaciones

Cuando creas conveniente usar un término técnico, anótalo con una explicación:

```html
En condiciones normales, un modelo de 32B<Note label="Aclaración">32B sigue la convención anglosajona, donde `billion` equivale a 10^9. Es decir, que son 32 mil millones de parámetros.</Note> parámetros en precisión completa ocupa decenas de gigas de VRAM.
```

El texto debería de poder leerse sin leer la anotación sin perder sentido.

## Frases cortas

Intenta que las frases no superen las ~30 palabras. Cuando una frase encadena varias subordinadas, es mejor partirla en dos.

En lugar de:

> Al tratar de estudiar cómo funciona un modelo grande de lenguaje por dentro, la primera frustración aparece en cuanto descubres que ni siquiera puedes cargarlo.

Considera:

> Si quieres estudiar cómo funciona un modelo grande de lenguaje por dentro, lo primero que necesitas es poder cargarlo. Pero en condiciones normales, un modelo de 32B parámetros en precisión completa ocupa decenas de gigas en memoria.

## Evita el gerundio copulativo

No uses gerundios como "siendo", "resultando" o "haciendo que" para unir dos ideas independientes. Es una construcción que la RAE desaconseja y que además puede provocar discordancias de número.

En lugar de:

> ...ocupa decenas de gigas en memoria, siendo inaccesibles para la mayor parte de las tarjetas gráficas domésticas.

Considera:

> ...ocupa decenas de gigas en memoria, fuera del alcance de la mayor parte de las tarjetas gráficas domésticas.

## Conecta las secciones

Cuando cambias de tema o introduces un proyecto o herramienta, añade una frase puente que conecte lo anterior con lo que viene. Evita los saltos abruptos.

En lugar de:

> *(gráfica de memoria)* En este artículo te hablo sobre **Chiquito**, un repositorio que he creado...

Considera:

> *(gráfica de memoria)* La pregunta natural es: ¿se puede sortear esa limitación? En este artículo te hablo sobre **Chiquito**, un repositorio que he creado...

## Sé concreto al nombrar una técnica

La primera vez que mencionas una técnica, da la idea clave en pocas palabras. No la dejes vaga.

En lugar de:

> ...propone una técnica para poder cargar modelos bastante más grandes que la memoria VRAM disponible: cargarlos poco a poco.

Considera:

> ...propone una técnica para cargar modelos más grandes que la VRAM disponible: cargar el modelo capa por capa, ejecutando cada bloque y liberándolo antes de cargar el siguiente.

## Un blockquote, una idea

No mezcles varias ideas (dato personal, aviso, caso de uso) en un mismo blockquote. Si el bloque contiene más de una idea, sepáralas en texto normal y blockquote, o en blockquotes distintos.

En lugar de:

> En mis pruebas usé un equipo con 8GB de VRAM y generar 20 tokens llevó más de 30 minutos. Obviamente no se puede usar esta técnica en producción. Cuando tiene sentido es cuando lo que quieres es examinar en local cómo funciona un modelo que no cabe en la memoria de tu tarjeta gráfica.

Considera:

> En mis pruebas, con un equipo de 8 GB de VRAM, generar 20 tokens llevó más de 30 minutos.

Esta técnica no tiene sentido en producción. Donde brilla es cuando quieres examinar en local cómo funciona un modelo que no cabe en la memoria de tu tarjeta gráfica.

## Evita muletillas de advertencia

Expresiones como "hay que advertir que", "cabe señalar que" o "es importante mencionar que" son rodeos. Ve al grano.

En lugar de:

> Antes de entrar en detalles sobre cómo funciona esta técnica, hay que advertir que **este enfoque implica una pérdida clara: el rendimiento**.

Considera:

> Antes de entrar en detalles, hay que dejarlo claro: **al cargar un modelo por capas se sacrifica el rendimiento**.

## Usa términos de forma consistente

No alternes entre sinónimos (ej. "librería" y "biblioteca"). Elige una forma y mantenla a lo largo de todo el artículo.

## Mantén el formato de los nombres propios

Si un nombre propio tiene una grafía oficial (por ejemplo, "PyTorch" con la T mayúscula), respétala en todo el artículo.

## Listas en línea cuando los elementos son breves

Cuando una lista enumera elementos breves y del mismo nivel, una enumeración en línea fluye mejor que una lista vertical.

En lugar de:

> Para poder cargar un modelo capa a capa, necesitas saber qué "forma" tiene ese modelo:
>
> - cuántas capas tiene,
> - qué tipo de módulos contiene cada una,
> - qué dimensiones tienen sus tensores.

Considera:

> Para poder cargar un modelo capa a capa, necesitas saber qué "forma" tiene: cuántas capas tiene, qué módulos contiene cada una y qué dimensiones tienen sus tensores.

## Cuidado con las frases que empiezan con "Y"

Empezar una frase o un punto de lista con "Y" puede funcionar como recurso retórico puntual, pero si se repite pierde efecto y suena informal.

En lugar de:

> - **Y** por último, una vez procesada la capa, la devuelve al dispositivo meta, liberando la VRAM.

Considera:

> - Por último, una vez procesada la capa, la devuelve al dispositivo meta, liberando la VRAM.

## Cuida las transiciones dentro de una sección

Añade una frase de cierre o de enlace al final de cada subsección ayuda al lector a entender por qué la siguiente le importa.

## Introduce los componentes interactivos

Cuando insertas un componente interactivo, no lo dejes caer sin contexto. Una frase antes o después que explique qué muestra y qué debería observar el lector lo hace más útil.

## Separa los actores en frases distintas

Cuando describes dos procesos que ocurren a la vez, no intentes meter ambos en la misma frase. Dale a cada actor su propia oración.

En lugar de:

> el productor ocupa el hueco cargando la siguiente capa de la ventana mientras tanto el consumidor ya estaba pidiéndole la siguiente capa a consumir a la caché, y así sucesivamente.

Considera:

> El productor ocupa el hueco cargando la siguiente capa de la ventana. Mientras tanto, el consumidor ya estaba pidiéndole a la caché la siguiente capa. Y así sucesivamente.
