# Invopee — Investigación de Operaciones, explicado fácil

## ¿De qué trata el proyecto?

Esta aplicación usa modelos de **Investigación de Operaciones (IO)** para
convertir datos de una empresa en comparaciones que ayuden a decidir. En vez de
elegir solo por intuición, se plantean opciones, escenarios posibles y límites
de recursos; después se calculan resultados que se pueden interpretar en el
negocio.

El caso principal estudia a **Innowise Group**, una empresa de desarrollo de
software. La pregunta es cómo asignar a 500 ingenieros el próximo año: enfocarse
en proyectos de Inteligencia Artificial (IA) o continuar con *Staff
Augmentation* (equipos de desarrollo asignados a clientes). También se
presentan ejemplos de teoría de colas y de planeación de proyectos.

## Actores y qué representa cada uno

### Caso principal: decisión de Innowise

- **Innowise Group:** quien toma la decisión y recibe los ingresos estimados.
- **Los 500 ingenieros:** capacidad de trabajo que se desea asignar; no son
  opciones diferentes, sino el recurso disponible.
- **Clientes europeos:** determinan qué tipo de servicio tendrá más demanda y
  qué tarifa se podría cobrar.
- **Mercado:** se representa mediante dos escenarios posibles, llamados
  *estados de la naturaleza*. No son actores que decidan, sino situaciones
  externas que Innowise no controla.
- **Itransition:** competidor usado en el ejemplo de teoría de juegos.
- **Estudio de mercado:** fuente hipotética de una señal favorable o
  desfavorable que podría ayudar a anticipar la demanda.

### Ejemplo de colas

- **Ejecución de pipeline (run):** el trabajo que llega al sistema cuando se
  sube código y se ejecuta una integración o prueba automática.
- **Runner:** el servidor que procesa ese trabajo.
- **Proyectos de software:** generan ejecuciones y comparten la capacidad de
  los runners.
- **CircleCI:** referencia pública usada para aproximar los datos; no significa
  que las mediciones sean datos internos de Innowise.

### Ejemplo de planeación PERT/CPM

- **Innowise:** equipo que realizaría el desarrollo.
- **Panaderías Modelo S.A. y sus sucursales:** cliente y usuarios del sistema
  ficticio PanDía.
- **Equipo del proyecto:** coordinador, arquitecto, desarrolladores, personal
  de calidad y operación; la cantidad propuesta es un supuesto del ejemplo.
- **Actividades A–N:** tareas necesarias, sus duraciones estimadas y las tareas
  que deben terminar antes de comenzar otras.

## Caso principal: decisión y datos

La capacidad anual se estima así:

**500 ingenieros × 2,000 horas por ingeniero = 1,000,000 horas**

La matriz de pagos expresa ingresos anuales estimados en **millones de dólares
(M USD)**:

| Alternativa de Innowise | Boom de IA (40%) | Estancamiento (60%) |
|---|---:|---:|
| Enfoque en IA y Big Data | 95 M USD | 40 M USD |
| Staff Augmentation | 75 M USD | 70 M USD |

- **Alternativa:** acción que sí puede elegir la empresa.
- **Estado de la naturaleza:** escenario del mercado que no controla la
  empresa.
- **Probabilidad:** posibilidad asignada a cada escenario. En el caso base, el
  boom tiene 40% y el estancamiento 60%; son datos del modelo, no una garantía
  de lo que ocurrirá.
- **Pago:** ingreso estimado para una combinación de alternativa y escenario.
  Se deriva de las horas disponibles, la tarifa y la ocupación estimada.
- **Tarifa (USD/h):** ingreso por cada hora facturada.
- **Ocupación:** proporción de las horas disponibles que se logra facturar.

Con esas probabilidades, el ingreso esperado es **62 M USD** para IA y
**72 M USD** para Staff Augmentation. En el escenario base, Staff Augmentation
es la mejor opción por valor esperado. Esto es una comparación del modelo, no
una predicción ni una recomendación financiera garantizada. Al cambiar las
probabilidades o los pagos, pueden cambiar los resultados.

## Qué análisis se hacen y qué significan

### Decisión bajo incertidumbre

- **Valor esperado (VEM):** promedio ponderado de los ingresos posibles por sus
  probabilidades. Ayuda a comparar opciones si se acepta usar esas
  probabilidades.
- **Maximin:** mira el peor resultado de cada opción y elige el menos malo.
  Representa una postura prudente.
- **Maximax:** mira el mejor resultado de cada opción y elige el más alto.
  Representa una postura optimista.
- **Minimax arrepentimiento:** busca reducir la mayor diferencia entre el
  resultado obtenido y el que se habría logrado con la mejor decisión para ese
  escenario. En negocio, representa el costo de haberse equivocado de estrategia.
- **Punto de indiferencia y robustez:** muestran cómo cambia la opción
  preferida cuando cambia la probabilidad del boom. Sirven para saber si la
  decisión depende mucho de una estimación específica.
- **Árbol de decisión:** presenta visualmente las opciones, los escenarios y
  sus resultados.

Estos criterios pueden recomendar opciones distintas porque responden a
actitudes distintas frente al riesgo. No hay que interpretar un solo criterio
como una certeza.

### Información de mercado y Bayes

El modelo permite evaluar un estudio que emite un dictamen favorable o
desfavorable:

- **Sensibilidad (80% en el caso base):** probabilidad de dictamen favorable si
  realmente hay boom.
- **Especificidad (90%):** probabilidad de dictamen desfavorable si ocurre
  estancamiento.
- **Probabilidad posterior:** estimación actualizada de cada escenario después
  de conocer el dictamen, calculada con Bayes.
- **Valor de información muestral:** cuánto mejoraría el ingreso esperado si
  se usa el resultado del estudio para elegir una estrategia.
- **Eficiencia del estudio:** compara el valor de esa información con el valor
  teórico de conocer el escenario con certeza.

En términos de negocio, estos resultados ayudan a decidir si conviene pagar
por investigar el mercado antes de comprometer recursos. Las características
del estudio son supuestos del análisis y no resultados de una encuesta real.

### Teoría de juegos

Compara las estrategias de Innowise con las de **Itransition**, considerando
que ambas compiten por clientes. Las tarifas y ocupaciones se usan para
estimar ingresos y la **ventaja relativa** de Innowise en cada combinación.
El **punto de silla**, si existe, indica una combinación estable de estrategias
bajo los supuestos del juego. Si no existe, el modelo puede indicar estrategias
mixtas.

Es una representación simplificada de la competencia, no un registro de
decisiones reales de Itransition.

## Ejemplos operativos

### Teoría de colas: M/M/1 y M/M/5

La cola representa ejecuciones de CI que esperan a que un runner las procese.
**M/M/1** representa un canal y **M/M/5** cinco runners trabajando en paralelo.
La letra M indica llegadas y tiempos de servicio modelados como aleatorios
exponenciales; también se supone una fila compartida y atención por orden de
llegada.

Datos principales:

- **λ (lambda):** ejecuciones que llegan por día.
- **μ (mu):** ejecuciones que un runner puede atender por día; se obtiene del
  tiempo medio de servicio. Un servicio más rápido significa mayor μ.
- **s:** cantidad de runners. Para M/M/1, s = 1; para M/M/5, s = 5.
- **ρ (rho):** utilización de la capacidad. En M/M/1 es λ/μ; en M/M/5 es la
  utilización promedio por runner. Si se acerca a 100%, hay poco margen para
  absorber picos.

Resultados y lectura de negocio:

- **P₀:** probabilidad de que el sistema esté vacío.
- **Lq:** número promedio de ejecuciones esperando.
- **L:** número promedio de ejecuciones en el sistema, esperando o en proceso.
- **Wq:** tiempo promedio de espera antes de empezar.
- **W:** tiempo promedio total desde que llega una ejecución hasta que termina.
- **Pw:** probabilidad de que una ejecución tenga que esperar.
- **P(n = k):** probabilidad de tener exactamente *k* ejecuciones en el sistema.

La comparación de escenarios permite ver el efecto de acelerar cada ejecución
o atender varios proyectos con cinco runners. El caso usa una tasa de llegada
de 2.86 ejecuciones por proyecto por día y un servicio medio de 11 minutos y
2 segundos, aproximados a partir de un informe público de CircleCI. El número
de proyectos (89) y la mejora de velocidad (reducir a la mitad el tiempo de
servicio) son supuestos ilustrativos. No son mediciones propias de Innowise.

### Planeación de proyectos: PERT/CPM

El ejemplo ficticio **PanDía** es una aplicación para pedir pan y pasteles por
adelantado y recogerlos en una sucursal. Las actividades A–N se ordenan según
sus dependencias para estimar la duración del proyecto.

- **Tiempo optimista, más probable y pesimista:** tres estimaciones para cada
  actividad, desde un caso favorable hasta uno difícil.
- **Tiempo esperado PERT:** duración promedio ponderada de esas tres
  estimaciones.
- **Ruta crítica:** secuencia de actividades que determina la duración total.
  Si una actividad crítica se atrasa, se atrasa la fecha final.
- **Holgura:** cuánto puede demorarse una actividad sin cambiar la fecha final.
- **Aceleración (crashing):** reducir la duración de tareas añadiendo recursos
  o costo; se compara el tiempo ganado con el gasto adicional.

Con los supuestos cargados, el proyecto dura **94.33 días hábiles** y la ruta
crítica contiene **12 actividades**. El escenario acelerado estima **72.17
días hábiles** y un costo adicional de **USD 9,736**. Son resultados del
ejemplo, no compromisos de duración o precio de Innowise.

## De dónde vienen los datos y cuáles son sus límites

Los valores iniciales están pensados para explicar los modelos. El caso
principal y el de teoría de juegos son escenarios de decisión configurables.
El ejemplo de colas aproxima ciertos datos con un informe público de CircleCI.
En PERT se combinan etapas y rangos de duración publicados con datos ficticios
de PanDía y otras estimaciones hipotéticas.

Por eso, los resultados deben leerse como **estimaciones condicionadas a los
datos y supuestos elegidos**, no como datos financieros internos, pronósticos
ciertos ni decisiones ya tomadas por las empresas. La aplicación permite
modificar algunos datos en **“Modificar datos”** y observar cómo cambian los
cálculos.

## Explicación módulo por módulo

La aplicación tiene siete módulos. Cada uno resuelve una pregunta distinta; por
eso, los resultados de colas y de PERT no son partes de la matriz de ingresos de
Innowise, sino ejemplos complementarios de otros temas de IO.

### 1. Planteamiento

**Pregunta:** ¿qué decisión debe tomar Innowise y con qué información?

Este módulo presenta el caso de los 500 ingenieros, las dos estrategias y los
dos escenarios de mercado. La sección **Modificar datos** permite cambiar
parámetros como la cantidad de ingenieros, las horas anuales y las
probabilidades. La **matriz de pagos** cruza cada estrategia con cada escenario
y muestra el ingreso anual estimado en millones de USD.

**Cómo leerlo:** cada fila representa algo que Innowise puede elegir; cada
columna, algo que podría ocurrir en el mercado. La empresa puede elegir la fila,
pero no controlar la columna.

### 2. Análisis de decisión

**Pregunta:** ¿qué estrategia conviene si no sabemos qué escenario ocurrirá?

Este módulo toma la matriz de pagos y las probabilidades del boom y del
estancamiento. Calcula el valor esperado de cada estrategia y también compara
criterios optimistas, pesimistas y de arrepentimiento. El árbol de decisión
muestra la secuencia «elegir una estrategia → ocurre un escenario → se obtiene
un ingreso». El punto de indiferencia identifica la probabilidad en la que dos
estrategias empatan; el análisis de robustez muestra cómo cambia la preferencia
si esa probabilidad varía. La información perfecta calcula cuánto valdría
conocer de antemano el escenario real.

**Datos clave:** pagos de la matriz y probabilidad de cada escenario.

**Cómo leerlo:** el valor esperado es un promedio condicionado a las
probabilidades ingresadas; maximin protege frente al peor caso, maximax elige
el mayor resultado posible y minimax arrepentimiento limita la pérdida de
oportunidad. Si los métodos no coinciden, reflejan distintas actitudes ante la
incertidumbre, no un error de cálculo.

### 3. Información muestral

**Pregunta:** ¿valdría la pena investigar el mercado antes de elegir?

El módulo **Bayes** actualiza las probabilidades iniciales cuando se recibe un
dictamen favorable o desfavorable. Usa la sensibilidad del estudio (qué tan
seguido detecta un boom cuando sí lo hay) y su especificidad (qué tan seguido
detecta estancamiento cuando sí ocurre). Luego calcula el valor esperado de
usar esa señal para elegir una estrategia.

**Datos clave:** probabilidades iniciales, sensibilidad, especificidad y pagos
de cada estrategia.

**Resultados:** las probabilidades posteriores indican qué escenario parece
más probable tras cada dictamen; el valor de información muestral estima la
mejora esperada por contar con el estudio; la eficiencia compara esa mejora con
el valor máximo teórico de la información perfecta.

**Cómo leerlo:** el valor de información es el máximo beneficio que justificaría
pagar por el estudio bajo estos supuestos; no es una cotización del costo real
de una investigación.

### 4. Teoría de juegos

**Pregunta:** ¿cómo cambia la ventaja de Innowise si también consideramos la
estrategia de un competidor?

Este módulo enfrenta las opciones de Innowise y de Itransition en una matriz.
Combina tarifas, preferencias del mercado y supuestos de ocupación para
calcular ingresos estimados y la ventaja de Innowise en cada combinación.

**Cómo leerlo:** el maximin muestra la mejor estrategia de Innowise si el
competidor responde de la forma menos favorable; el minimax indica la respuesta
del competidor que limita esa ventaja. Si ambos coinciden en una celda, hay un
punto de silla: una combinación estable de estrategias puras en este modelo.
Si no, se reporta que no hay punto de silla puro.

**Límite:** las estrategias y tasas de ocupación representan un escenario
académico simplificado, no información sobre decisiones reales del competidor.

### 5. Teoría de colas (M/M/1)

**Pregunta:** ¿cuánta espera puede generarse cuando un solo runner procesa
ejecuciones de CI?

El modelo considera una fila y un runner. Usa la tasa de llegada de ejecuciones
(λ) y el tiempo promedio que tarda el runner en atender una (con el que se
calcula μ). Compara el caso base con otro donde el servicio tarda la mitad.

**Resultados:** utilización (ρ), probabilidad de sistema vacío (P₀), ejecuciones
promedio en cola (Lq) y en todo el sistema (L), tiempos promedio de espera
(Wq) y permanencia total (W), probabilidad de esperar (Pw) y probabilidades de
tener cierta cantidad de ejecuciones.

**Cómo leerlo:** si las llegadas igualan o superan la capacidad del runner
(λ ≥ μ), la cola no es estable: en promedio, el trabajo se acumula. Una
utilización alta también indica poco margen para absorber picos.

### 6. Canales múltiples (M/M/5)

**Pregunta:** ¿cómo se comporta la fila cuando varios runners pueden atender
trabajos en paralelo?

Este módulo extiende el caso anterior a cinco runners y una sola fila
compartida. La llegada total se estima multiplicando la tasa por proyecto por
89 proyectos. Usa el mismo tiempo medio de servicio y también compara tres
escenarios: un runner sin mejora, un runner con servicio más rápido y cinco
runners con la carga total.

**Datos clave:** llegadas por proyecto (λ), cantidad de proyectos, duración del
servicio, número de runners (s) y supuesto de mejora.

**Resultados:** carga ofrecida (a), utilización por runner (ρ), probabilidad de
esperar (Pw), cantidad promedio en la fila (Lq) y en el sistema (L), tiempos de
espera y permanencia, y distribución de la cantidad de ejecuciones.

**Cómo leerlo:** el sistema es estable si la tasa total de llegada es menor
que la capacidad total (λ < s·μ). La comparación ayuda a discutir si conviene
aumentar canales o acelerar el servicio; no determina por sí sola el costo de
cada opción.

### 7. Gestión de proyectos (PERT/CPM)

**Pregunta:** ¿cuánto podría tardar PanDía, qué tareas controlan la fecha final
y cuánto costaría terminar antes?

El módulo organiza las 14 actividades A–N, muestra qué tareas dependen de otras
y les asigna tres duraciones: optimista, más probable y pesimista. PERT calcula
una duración esperada para cada tarea; CPM usa las dependencias para obtener
fechas tempranas y tardías, holgura y ruta crítica.

La red PERT muestra el orden de las tareas y resalta la ruta crítica; el Gantt
las ubica en un calendario. Las secciones de aceleración comparan duración y
costo normales con opciones de reducción de tiempos. Seguimiento explica cómo
comparar el avance real con el plan, y Trazabilidad separa la información
publicada de los datos hipotéticos del caso.

**Cómo leerlo:** las actividades críticas no tienen margen para retrasarse sin
mover la fecha final. Las actividades con holgura pueden absorber cierto
retraso. La aceleración solo conviene si el valor de terminar antes compensa el
costo adicional.

### 8. Resultado y recomendación

La sección **Resultado** reúne las recomendaciones de los criterios de decisión,
el valor de información y el resultado del juego. Es un resumen del caso
principal, no un promedio que mezcle los módulos. Las métricas de colas y las
fechas y costos de PanDía pertenecen a sus propios modelos.

## Cómo recorrer la aplicación

- **Modo análisis:** permite navegar por el planteamiento, los datos, las
  fórmulas, los métodos y los resultados de cada tema.
- **Modo presentación:** muestra una selección ordenada de secciones para
  exponer el trabajo.
- **Planteamiento:** empieza por el caso principal, su matriz de pagos y el
  resumen de la decisión.
- **Información muestral y teoría de juegos:** profundiza en el valor de
  investigar y en la competencia.
- **Teoría de colas y Canales múltiples:** explican el funcionamiento y la
  capacidad del sistema de ejecuciones.
- **Gestión de proyectos (PERT/CPM):** muestra las actividades, duraciones,
  ruta crítica, calendario y costos de aceleración.

En conjunto, la herramienta enseña cómo la IO conecta **recursos, escenarios,
incertidumbre, tiempos y costos** con preguntas concretas de negocio: qué
estrategia elegir, cuánto esperar, cuánta capacidad hace falta y qué tareas
pueden retrasar un proyecto.
