/**
 * Datos estructurados del documento: Banco_Temas_Exposicion_ADSO.pdf
 * SENA — CIMM Regional Boyacá · Tecnólogo ADSO
 * Instructor: Osman Alonso Aranguren Escobar
 */

window.ADSO_CONFIG = {
  // Pegue aquí la URL /exec de su Google Apps Script para que todos los aprendices envíen directo a su Google Sheet sin configurar nada:
  scriptUrlFija: 'https://script.google.com/macros/s/AKfycbyClhaP_jBJ1w5mxSK4pONhKCY9p0fyLJciNX29j8IXMsFvtPXhoIBPty8h_c3obY0r/exec',
  programa: 'Análisis y Desarrollo de Software (ADSO)',
  centro: 'SENA — CIMM Regional Boyacá',
  fichaDefault: '3232460',
  instructorDefault: 'Osman Alonso Aranguren Escobar',
  instructorPinHashDefault: '396662581',
  notaMinimaAprobatoria: 70,
  escalaMin: 0,
  escalaMax: 100,
  cronograma: [
    { etapa: 'Asignación e investigación', fechas: '6 – 17 oct', detalle: 'Cada grupo recibe su tema, investiga y arma su plan' },
    { etapa: 'Construcción y ensayo', fechas: '20 oct – 7 nov', detalle: 'Programan la app, instalan entornos y ensayan la demo' },
    { etapa: 'Exposición — Sesión 1', fechas: 'Lun 10 nov', detalle: 'Grupos 1 a 4' },
    { etapa: 'Exposición — Sesión 2', fechas: 'Mié 12 nov', detalle: 'Grupos 5 a 8' },
    { etapa: 'Exposición — Sesión 3', fechas: 'Lun 17 nov', detalle: 'Grupos 9 a 12' }
  ],
  perfilesTiempo: {
    30: [
      { key: 'intro', nombre: 'Introducción al tema', minutos: 5, descripcion: 'Qué es la tecnología y qué problema resuelve' },
      { key: 'demo', nombre: 'Demostración en vivo', minutos: 12, descripcion: 'La app funcionando y el código clave' },
      { key: 'practica', nombre: '"Ahora háganlo ustedes"', minutos: 10, descripcion: 'Guiar a los compañeros paso a paso' },
      { key: 'preguntas', nombre: 'Preguntas', minutos: 3, descripcion: 'Dudas del grupo y del instructor' }
    ],
    45: [
      { key: 'intro', nombre: 'Introducción al tema', minutos: 7, descripcion: 'Qué es la tecnología y qué problema resuelve' },
      { key: 'demo', nombre: 'Demostración en vivo', minutos: 18, descripcion: 'La app funcionando y el código clave' },
      { key: 'practica', nombre: '"Ahora háganlo ustedes"', minutos: 15, descripcion: 'Guiar a los compañeros paso a paso' },
      { key: 'preguntas', nombre: 'Preguntas', minutos: 5, descripcion: 'Dudas del grupo y del instructor' }
    ],
    60: [
      { key: 'intro', nombre: 'Introducción al tema', minutos: 10, descripcion: 'Qué es la tecnología y qué problema resuelve' },
      { key: 'demo', nombre: 'Demostración en vivo', minutos: 25, descripcion: 'Construcción y app funcionando en vivo' },
      { key: 'practica', nombre: '"Ahora háganlo ustedes"', minutos: 20, descripcion: 'Guiar a los compañeros a reproducir el ejercicio' },
      { key: 'preguntas', nombre: 'Preguntas', minutos: 5, descripcion: 'Dudas del grupo y del instructor' }
    ],
    75: [
      { key: 'intro', nombre: 'Introducción al tema', minutos: 10, descripcion: 'Qué es la tecnología y qué problema resuelve' },
      { key: 'demo', nombre: 'Demostración en vivo', minutos: 35, descripcion: 'Construcción completa (APK + Web / Dos servicios) en vivo' },
      { key: 'practica', nombre: '"Ahora háganlo ustedes"', minutos: 25, descripcion: 'Guiar a los compañeros a probarlo en sus equipos/celulares' },
      { key: 'preguntas', nombre: 'Preguntas', minutos: 5, descripcion: 'Dudas del grupo y del instructor' }
    ],
    90: [
      { key: 'intro', nombre: 'Introducción al tema', minutos: 12, descripcion: 'Qué es la tecnología y qué problema resuelve' },
      { key: 'demo', nombre: 'Demostración en vivo', minutos: 38, descripcion: 'Construcción paso a paso y demostración completa' },
      { key: 'practica', nombre: '"Ahora háganlo ustedes"', minutos: 30, descripcion: 'Taller práctico guiado con todos los compañeros' },
      { key: 'preguntas', nombre: 'Preguntas', minutos: 10, descripcion: 'Dudas del grupo y retroalimentación' }
    ]
  }
};

window.TEMARIO_ADSO = [
  {
    id: 1,
    titulo: 'API REST con Spring Boot (Java)',
    categoria: 'Backend',
    grupoTecnologia: 'Backend / Datos',
    tecnologia: 'Java 17 + Spring Boot + Maven',
    sesion: 'Sesión 1 (Lun 10 nov)',
    tiempoMinutos: 60,
    resumen: 'Construir el "cerebro" del sistema: una API que gestione un CRUD de "productos" con endpoints que otros programas puedan consumir.',
    secciones: [
      {
        key: 'investigacion',
        titulo: '¿Qué deben investigar? (antes de exponer)',
        icono: 'bi-journal-bookmark-fill',
        items: [
          'Explica claramente qué es una API REST y qué significan los verbos GET, POST, PUT y DELETE.',
          'Explica qué es Spring Boot y para qué sirven las anotaciones @RestController, @GetMapping y @PostMapping.',
          'Define qué es un endpoint y explica la estructura del formato JSON.',
          'Explica qué es un código de estado HTTP y ejemplifica los códigos 200, 201, 404 y 500.'
        ]
      },
      {
        key: 'hacer',
        titulo: '¿Qué deben hacer? (construir y mostrar paso a paso)',
        icono: 'bi-code-square',
        items: [
          '1. Crear el proyecto en start.spring.io con las dependencias Spring Web y (opcional) Spring Data.',
          '2. Crear la clase modelo Producto (id, nombre, precio, cantidad).',
          '3. Crear el controlador con los cuatro endpoints: listar, crear, actualizar y eliminar productos.',
          '4. Probar cada endpoint con Postman o Thunder Client y mostrar las respuestas en JSON.',
          '5. Explicar la diferencia entre guardar en memoria (una lista) y guardar en base de datos.'
        ]
      },
      {
        key: 'lograr',
        titulo: '¿Qué deben lograr que sus compañeros hagan? ("Ahora háganlo ustedes")',
        icono: 'bi-people-fill',
        items: [
          'Logran guiar a los compañeros para que levanten el proyecto en su máquina, prueben la API (ej. crear un producto) usando Postman o el navegador, y entiendan qué devuelve cada endpoint.'
        ]
      },
      {
        key: 'entregables',
        titulo: 'Entregables de la exposición',
        icono: 'bi-box-seam-fill',
        items: [
          'Proyecto publicado correctamente en GitHub.',
          'Colección de Postman con las 4 pruebas (GET, POST, PUT, DELETE).',
          'Demostración en vivo funcional de un CRUD completo.'
        ]
      },
      {
        key: 'tiempoPreguntas',
        titulo: 'Manejo del tiempo y Sesión de preguntas',
        icono: 'bi-stopwatch-fill',
        items: [
          'Cumplimiento y buen aprovechamiento del tiempo asignado (base 60 min: Intro 10m, Demo en vivo 25m, Práctica compañeros 20m, Preguntas 5m) con ritmo pedagógico.',
          'Dominio técnico y claridad al responder preguntas de los compañeros y del instructor.'
        ]
      }
    ]
  },
  {
    id: 2,
    titulo: 'App móvil con Flutter',
    categoria: 'Cliente móvil',
    grupoTecnologia: 'Clientes',
    tecnologia: 'Flutter + Dart (Android Studio / VS Code)',
    sesion: 'Sesión 1 (Lun 10 nov)',
    tiempoMinutos: 75,
    resumen: 'Construir una app que funcione en el celular, genere su archivo instalable (APK) y, con el mismo código, se publique también como página web ("un solo código, varias plataformas").',
    secciones: [
      {
        key: 'investigacion',
        titulo: '¿Qué deben investigar? (antes de exponer)',
        icono: 'bi-journal-bookmark-fill',
        items: [
          'Explica qué es Flutter, qué es el lenguaje Dart y por qué se dice que es multiplataforma.',
          'Explica qué es un widget y la diferencia entre StatelessWidget y StatefulWidget.',
          'Explica qué es un APK, para qué sirve y qué diferencia hay entre modo debug y modo release.',
          'Explica cómo consume Flutter una API REST (paquete http y manejo de JSON).',
          'Explica qué significa que Flutter compile "a web", qué es Flutter Web y qué navegadores soporta.'
        ]
      },
      {
        key: 'hacer',
        titulo: '¿Qué deben hacer? (construir y mostrar paso a paso)',
        icono: 'bi-code-square',
        items: [
          '1. Instalar el SDK de Flutter y verificar con "flutter doctor" que todo esté correcto.',
          '2. Crear el proyecto con "flutter create" y explicar la estructura de carpetas (lib, pubspec.yaml).',
          '3. Construir una pantalla que muestre una lista de "productos" y un botón para agregar uno nuevo.',
          '4. Conectar la app a la API del Tema 1 o 3 (o usar datos de prueba si la API no está lista).',
          '5. Ejecutar la app en el emulador de Android o en un celular real y mostrarla funcionando.'
        ]
      },
      {
        key: 'especial',
        titulo: 'Parte especial de este grupo: generar el APK y la versión web',
        icono: 'bi-stars',
        esEspecial: true,
        items: [
          '1. GENERAR EL APK: ejecutar "flutter build apk --release", explicar dónde queda el archivo (build/app/outputs/flutter-apk/app-release.apk) y cómo se instala en Android.',
          '2. TRANSFORMAR A WEB: habilitar soporte web con "flutter config --enable-web" y ejecutar "flutter run -d chrome" para verla en el navegador.',
          '3. COMPILAR LA WEB: ejecutar "flutter build web" y explicar la carpeta "build/web" con archivos HTML/JS listos para cualquier hosting.',
          '4. Mostrar la MISMA app corriendo en dos lugares simultáneamente: en el celular (APK) y en el navegador (web).'
        ]
      },
      {
        key: 'lograr',
        titulo: '¿Qué deben lograr que sus compañeros hagan? ("Ahora háganlo ustedes")',
        icono: 'bi-people-fill',
        items: [
          'Logran que los compañeros instalen el APK en su propio celular y lo abran, y además vean la misma app funcionando en el navegador entendiendo que salieron del mismo código fuente.'
        ]
      },
      {
        key: 'entregables',
        titulo: 'Entregables de la exposición',
        icono: 'bi-box-seam-fill',
        items: [
          'Proyecto publicado correctamente en GitHub.',
          'Archivo APK generado y listo para instalar.',
          'Enlace o carpeta compilada de la versión web.',
          'Demostración en vivo en celular y en navegador.'
        ]
      },
      {
        key: 'tiempoPreguntas',
        titulo: 'Manejo del tiempo y Sesión de preguntas',
        icono: 'bi-stopwatch-fill',
        items: [
          'Cumplimiento y buen aprovechamiento del tiempo asignado (base 75 min para Flutter APK + Web: Intro 10m, Demo 35m, Práctica 25m, Preguntas 5m) cubriendo todas las etapas.',
          'Dominio técnico y claridad al responder preguntas de los compañeros y del instructor.'
        ]
      }
    ]
  },
  {
    id: 3,
    titulo: 'API REST con Node.js + Express',
    categoria: 'Backend',
    grupoTecnologia: 'Backend / Datos',
    tecnologia: 'Node.js + Express + JavaScript',
    sesion: 'Sesión 1 (Lun 10 nov)',
    tiempoMinutos: 60,
    resumen: 'Construir el mismo CRUD de "productos" del Tema 1, pero en JavaScript, para comparar cómo se resuelve el mismo problema con otra tecnología.',
    secciones: [
      {
        key: 'investigacion',
        titulo: '¿Qué deben investigar? (antes de exponer)',
        icono: 'bi-journal-bookmark-fill',
        items: [
          'Explica qué es Node.js y por qué permite usar JavaScript fuera del navegador.',
          'Explica qué es Express y qué es un middleware.',
          'Explica qué es npm y para qué sirve el archivo package.json.',
          'Explica en qué se parece y en qué se diferencia Node.js + Express frente a Spring Boot.'
        ]
      },
      {
        key: 'hacer',
        titulo: '¿Qué deben hacer? (construir y mostrar paso a paso)',
        icono: 'bi-code-square',
        items: [
          '1. Inicializar el proyecto con "npm init" e instalar Express.',
          '2. Crear el servidor básico que escuche en un puerto.',
          '3. Definir las rutas del CRUD de productos (GET, POST, PUT, DELETE).',
          '4. Probar los endpoints con Postman y mostrar las respuestas JSON.',
          '5. Comparar lado a lado un endpoint de Node con el mismo de Spring Boot.'
        ]
      },
      {
        key: 'lograr',
        titulo: '¿Qué deben lograr que sus compañeros hagan? ("Ahora háganlo ustedes")',
        icono: 'bi-people-fill',
        items: [
          'Logran que los compañeros comparen las dos APIs (Node.js vs Java Spring Boot) y puedan nombrar al menos dos diferencias claras.'
        ]
      },
      {
        key: 'entregables',
        titulo: 'Entregables de la exposición',
        icono: 'bi-box-seam-fill',
        items: [
          'Proyecto publicado correctamente en GitHub.',
          'Colección de Postman funcional.',
          'Tabla comparativa Node.js vs Spring Boot.'
        ]
      },
      {
        key: 'tiempoPreguntas',
        titulo: 'Manejo del tiempo y Sesión de preguntas',
        icono: 'bi-stopwatch-fill',
        items: [
          'Cumplimiento y buen aprovechamiento del tiempo asignado (base 60 min: Intro 10m, Demo en vivo 25m, Práctica compañeros 20m, Preguntas 5m) con ritmo pedagógico.',
          'Dominio técnico y claridad al responder preguntas de los compañeros y del instructor.'
        ]
      }
    ]
  },
  {
    id: 4,
    titulo: 'Frontend con Angular',
    categoria: 'Cliente web',
    grupoTecnologia: 'Clientes',
    tecnologia: 'Angular + TypeScript',
    sesion: 'Sesión 1 (Lun 10 nov)',
    tiempoMinutos: 60,
    resumen: 'Construir la cara visible de la aplicación en el navegador: una pantalla que liste productos y un formulario para crear uno nuevo.',
    secciones: [
      {
        key: 'investigacion',
        titulo: '¿Qué deben investigar? (antes de exponer)',
        icono: 'bi-journal-bookmark-fill',
        items: [
          'Explica qué es Angular y qué es TypeScript.',
          'Explica qué es un componente en Angular y qué son las plantillas (templates).',
          'Explica cómo se consume una API con el servicio HttpClient.',
          'Explica qué es el data binding (enlace de datos) en Angular.'
        ]
      },
      {
        key: 'hacer',
        titulo: '¿Qué deben hacer? (construir y mostrar paso a paso)',
        icono: 'bi-code-square',
        items: [
          '1. Instalar Angular CLI y crear el proyecto con "ng new".',
          '2. Generar un componente para la lista de productos con "ng generate component".',
          '3. Consumir la API (Tema 1 o 3) para traer y mostrar los productos.',
          '4. Crear un formulario para agregar un producto nuevo.',
          '5. Ejecutar con "ng serve" y mostrar la pantalla en el navegador.'
        ]
      },
      {
        key: 'lograr',
        titulo: '¿Qué deben lograr que sus compañeros hagan? ("Ahora háganlo ustedes")',
        icono: 'bi-people-fill',
        items: [
          'Logran que los compañeros creen un componente simple y lo muestren en pantalla, entendiendo cómo Angular separa la lógica (TypeScript) de la vista (HTML).'
        ]
      },
      {
        key: 'entregables',
        titulo: 'Entregables de la exposición',
        icono: 'bi-box-seam-fill',
        items: [
          'Proyecto publicado correctamente en GitHub.',
          'Demostración en vivo de la pantalla consumiendo la API.'
        ]
      },
      {
        key: 'tiempoPreguntas',
        titulo: 'Manejo del tiempo y Sesión de preguntas',
        icono: 'bi-stopwatch-fill',
        items: [
          'Cumplimiento y buen aprovechamiento del tiempo asignado (base 60 min: Intro 10m, Demo en vivo 25m, Práctica compañeros 20m, Preguntas 5m) con ritmo pedagógico.',
          'Dominio técnico y claridad al responder preguntas de los compañeros y del instructor.'
        ]
      }
    ]
  },
  {
    id: 5,
    titulo: 'Frontend con React',
    categoria: 'Cliente web',
    grupoTecnologia: 'Clientes',
    tecnologia: 'React + JavaScript (Vite)',
    sesion: 'Sesión 2 (Mié 12 nov)',
    tiempoMinutos: 60,
    resumen: 'La misma pantalla del Tema 4, pero en React, para contrastar el enfoque de los dos frameworks de frontend más usados.',
    secciones: [
      {
        key: 'investigacion',
        titulo: '¿Qué deben investigar? (antes de exponer)',
        icono: 'bi-journal-bookmark-fill',
        items: [
          'Explica qué es React y qué es un componente funcional.',
          'Explica qué es JSX y cómo combina estructura y lógica.',
          'Explica qué son los hooks (especialmente useState y useEffect).',
          'Explica en qué se diferencia React de Angular.'
        ]
      },
      {
        key: 'hacer',
        titulo: '¿Qué deben hacer? (construir y mostrar paso a paso)',
        icono: 'bi-code-square',
        items: [
          '1. Crear el proyecto con Vite ("npm create vite").',
          '2. Crear un componente que muestre la lista de productos.',
          '3. Usar useState para guardar los productos y useEffect para traerlos de la API.',
          '4. Agregar un formulario para crear un producto.',
          '5. Ejecutar y mostrar la pantalla funcionando.'
        ]
      },
      {
        key: 'lograr',
        titulo: '¿Qué deben lograr que sus compañeros hagan? ("Ahora háganlo ustedes")',
        icono: 'bi-people-fill',
        items: [
          'Logran que los compañeros creen un componente con useState y observen en vivo cómo cambia la vista cuando cambian los datos (reactividad).'
        ]
      },
      {
        key: 'entregables',
        titulo: 'Entregables de la exposición',
        icono: 'bi-box-seam-fill',
        items: [
          'Proyecto publicado correctamente en GitHub.',
          'Demostración funcional de la pantalla en React.',
          'Comparación breve y clara entre React vs Angular.'
        ]
      },
      {
        key: 'tiempoPreguntas',
        titulo: 'Manejo del tiempo y Sesión de preguntas',
        icono: 'bi-stopwatch-fill',
        items: [
          'Cumplimiento y buen aprovechamiento del tiempo asignado (base 60 min: Intro 10m, Demo en vivo 25m, Práctica compañeros 20m, Preguntas 5m) con ritmo pedagógico.',
          'Dominio técnico y claridad al responder preguntas de los compañeros y del instructor.'
        ]
      }
    ]
  },
  {
    id: 6,
    titulo: 'Frontend con Vue.js',
    categoria: 'Cliente web',
    grupoTecnologia: 'Clientes',
    tecnologia: 'Vue.js 3 (Vite)',
    sesion: 'Sesión 2 (Mié 12 nov)',
    tiempoMinutos: 60,
    resumen: 'La misma pantalla de los Temas 4 y 5, en Vue.js — considerada la opción más sencilla para empezar en frontend.',
    secciones: [
      {
        key: 'investigacion',
        titulo: '¿Qué deben investigar? (antes de exponer)',
        icono: 'bi-journal-bookmark-fill',
        items: [
          'Explica qué es Vue.js y por qué se considera fácil de aprender.',
          'Explica qué es un componente de un solo archivo (.vue: template, script, style).',
          'Explica qué es el data binding en Vue (la directiva v-model).',
          'Explica qué son y cómo funcionan las directivas v-for y v-if.'
        ]
      },
      {
        key: 'hacer',
        titulo: '¿Qué deben hacer? (construir y mostrar paso a paso)',
        icono: 'bi-code-square',
        items: [
          '1. Crear el proyecto con "npm create vue".',
          '2. Crear un componente que liste los productos usando v-for.',
          '3. Conectar los datos de un formulario con v-model.',
          '4. Consumir la API para traer y enviar productos.',
          '5. Ejecutar y mostrar la pantalla en el navegador.'
        ]
      },
      {
        key: 'lograr',
        titulo: '¿Qué deben lograr que sus compañeros hagan? ("Ahora háganlo ustedes")',
        icono: 'bi-people-fill',
        items: [
          'Logran que los compañeros enlacen un dato al HTML con data binding (v-model) y lo modifiquen en vivo, viendo cómo la pantalla se actualiza sola.'
        ]
      },
      {
        key: 'entregables',
        titulo: 'Entregables de la exposición',
        icono: 'bi-box-seam-fill',
        items: [
          'Proyecto publicado correctamente en GitHub.',
          'Demostración del data binding en vivo consumiendo datos.'
        ]
      },
      {
        key: 'tiempoPreguntas',
        titulo: 'Manejo del tiempo y Sesión de preguntas',
        icono: 'bi-stopwatch-fill',
        items: [
          'Cumplimiento y buen aprovechamiento del tiempo asignado (base 60 min: Intro 10m, Demo en vivo 25m, Práctica compañeros 20m, Preguntas 5m) con ritmo pedagógico.',
          'Dominio técnico y claridad al responder preguntas de los compañeros y del instructor.'
        ]
      }
    ]
  },
  {
    id: 7,
    titulo: 'Autenticación con JWT y roles (RBAC) en Spring Boot',
    categoria: 'Seguridad',
    grupoTecnologia: 'Backend / Datos',
    tecnologia: 'Spring Boot + Spring Security + JWT',
    sesion: 'Sesión 2 (Mié 12 nov)',
    tiempoMinutos: 60,
    resumen: 'Ponerle "llave" a la API: agregar login que emita un token y proteger las rutas según el rol del usuario (administrador o usuario normal).',
    secciones: [
      {
        key: 'investigacion',
        titulo: '¿Qué deben investigar? (antes de exponer)',
        icono: 'bi-journal-bookmark-fill',
        items: [
          'Explica claramente qué es la autenticación y qué es la autorización (y por qué no son lo mismo).',
          'Explica qué es un token JWT y de qué partes se compone (Header, Payload, Signature).',
          'Explica qué es RBAC (control de acceso basado en roles).',
          'Explica por qué es mala idea guardar las contraseñas en texto plano y cómo funciona el hashing.'
        ]
      },
      {
        key: 'hacer',
        titulo: '¿Qué deben hacer? (construir y mostrar paso a paso)',
        icono: 'bi-code-square',
        items: [
          '1. Agregar Spring Security al proyecto del Tema 1.',
          '2. Crear un endpoint de login que valide usuario y clave y devuelva un token JWT.',
          '3. Proteger los endpoints: solo el rol ADMIN puede crear o borrar productos.',
          '4. Mostrar qué pasa al entrar SIN token (acceso denegado) y CON token (acceso permitido).',
          '5. Explicar cómo se envía el token en la cabecera Authorization (Bearer).'
        ]
      },
      {
        key: 'lograr',
        titulo: '¿Qué deben lograr que sus compañeros hagan? ("Ahora háganlo ustedes")',
        icono: 'bi-people-fill',
        items: [
          'Logran que los compañeros intenten entrar a una ruta protegida sin token (comprobando el fallo) y luego con un token válido (comprobando el acceso).'
        ]
      },
      {
        key: 'entregables',
        titulo: 'Entregables de la exposición',
        icono: 'bi-box-seam-fill',
        items: [
          'Proyecto publicado correctamente en GitHub.',
          'Colección de Postman mostrando pruebas de acceso con y sin token.',
          'Diagrama claro del flujo de autenticación JWT y roles.'
        ]
      },
      {
        key: 'tiempoPreguntas',
        titulo: 'Manejo del tiempo y Sesión de preguntas',
        icono: 'bi-stopwatch-fill',
        items: [
          'Cumplimiento y buen aprovechamiento del tiempo asignado (base 60 min: Intro 10m, Demo en vivo 25m, Práctica compañeros 20m, Preguntas 5m) con ritmo pedagógico.',
          'Dominio técnico y claridad al responder preguntas de los compañeros y del instructor.'
        ]
      }
    ]
  },
  {
    id: 8,
    titulo: 'ORM con Hibernate (Java)',
    categoria: 'Datos',
    grupoTecnologia: 'Backend / Datos',
    tecnologia: 'Java + Hibernate / JPA',
    sesion: 'Sesión 2 (Mié 12 nov)',
    tiempoMinutos: 60,
    resumen: 'Guardar y consultar datos SIN escribir SQL a mano: mapear una tabla de la base de datos a un objeto Java y dejar que Hibernate haga el trabajo pesado.',
    secciones: [
      {
        key: 'investigacion',
        titulo: '¿Qué deben investigar? (antes de exponer)',
        icono: 'bi-journal-bookmark-fill',
        items: [
          'Explica qué es un ORM (Mapeo Objeto-Relacional) y qué problema resuelve.',
          'Explica para qué sirven las anotaciones @Entity, @Id y @Column.',
          'Explica qué es JPA y qué relación tiene con Hibernate.',
          'Analiza las ventajas y desventajas de usar un ORM frente a escribir SQL directamente.'
        ]
      },
      {
        key: 'hacer',
        titulo: '¿Qué deben hacer? (construir y mostrar paso a paso)',
        icono: 'bi-code-square',
        items: [
          '1. Configurar la conexión a la base de datos (MySQL o H2).',
          '2. Crear una clase Producto anotada como @Entity.',
          '3. Guardar un producto y luego listarlos, SIN escribir una sola línea de SQL.',
          '4. Mostrar en la consola el SQL que Hibernate genera automáticamente.',
          '5. Explicar cómo se refleja en la tabla de base de datos cada operación.'
        ]
      },
      {
        key: 'lograr',
        titulo: '¿Qué deben lograr que sus compañeros hagan? ("Ahora háganlo ustedes")',
        icono: 'bi-people-fill',
        items: [
          'Logran que los compañeros agreguen un campo nuevo a la entidad (por ejemplo, "categoría") y comprueben cómo se refleja automáticamente en la tabla.'
        ]
      },
      {
        key: 'entregables',
        titulo: 'Entregables de la exposición',
        icono: 'bi-box-seam-fill',
        items: [
          'Proyecto publicado correctamente en GitHub.',
          'Captura o evidencia del SQL autogenerado por Hibernate.',
          'Demostración en vivo de guardar y listar registros.'
        ]
      },
      {
        key: 'tiempoPreguntas',
        titulo: 'Manejo del tiempo y Sesión de preguntas',
        icono: 'bi-stopwatch-fill',
        items: [
          'Cumplimiento y buen aprovechamiento del tiempo asignado (base 60 min: Intro 10m, Demo en vivo 25m, Práctica compañeros 20m, Preguntas 5m) con ritmo pedagógico.',
          'Dominio técnico y claridad al responder preguntas de los compañeros y del instructor.'
        ]
      }
    ]
  },
  {
    id: 9,
    titulo: 'Bases de datos y backends: SQL, BaaS e IA',
    categoria: 'Datos',
    grupoTecnologia: 'Transversales',
    tecnologia: 'PostgreSQL, Supabase, InsForge (BaaS para IA/MCP), MongoDB',
    sesion: 'Sesión 3 (Lun 17 nov)',
    tiempoMinutos: 60,
    resumen: 'Comparar cuatro formas de guardar los mismos datos: una base relacional clásica, dos BaaS (Backend como Servicio) y una base NoSQL documental.',
    secciones: [
      {
        key: 'investigacion',
        titulo: '¿Qué deben investigar? (antes de exponer)',
        icono: 'bi-journal-bookmark-fill',
        items: [
          'Explica qué es una base de datos relacional (SQL) y qué es una NoSQL documental.',
          'Explica qué es un BaaS (Backend as a Service) y qué trabajo ahorra al desarrollador.',
          'Explica qué es Supabase y qué es MongoDB.',
          'Explica qué es InsForge y qué significa que sea un BaaS para agentes de IA con MCP.'
        ]
      },
      {
        key: 'hacer',
        titulo: '¿Qué deben hacer? (construir y mostrar paso a paso)',
        icono: 'bi-code-square',
        items: [
          '1. Definir los mismos datos de "productos" para los cuatro enfoques.',
          '2. Hacer la operación de crear y consultar un producto en PostgreSQL.',
          '3. Hacer lo mismo en Supabase (mostrando su panel visual).',
          '4. Hacer lo mismo en MongoDB (documento JSON/BSON en lugar de fila).',
          '5. Mencionar InsForge y explicar por qué un BaaS pensado para IA es distinto.'
        ]
      },
      {
        key: 'lograr',
        titulo: '¿Qué deben lograr que sus compañeros hagan? ("Ahora háganlo ustedes")',
        icono: 'bi-people-fill',
        items: [
          'Logran que los compañeros realicen la misma operación (crear o consultar un dato) en al menos dos de las opciones y noten las diferencias entre ellas.'
        ]
      },
      {
        key: 'entregables',
        titulo: 'Entregables de la exposición',
        icono: 'bi-box-seam-fill',
        items: [
          'Repositorio o documento estructurado con los ejemplos implementados.',
          'Tabla comparativa completa de las cuatro opciones (PostgreSQL, Supabase, MongoDB, InsForge).'
        ]
      },
      {
        key: 'tiempoPreguntas',
        titulo: 'Manejo del tiempo y Sesión de preguntas',
        icono: 'bi-stopwatch-fill',
        items: [
          'Cumplimiento y buen aprovechamiento del tiempo asignado (base 60 min: Intro 10m, Demo en vivo 25m, Práctica compañeros 20m, Preguntas 5m) con ritmo pedagógico.',
          'Dominio técnico y claridad al responder preguntas de los compañeros y del instructor.'
        ]
      }
    ]
  },
  {
    id: 10,
    titulo: 'Docker: dockerizar una API',
    categoria: 'Despliegue',
    grupoTecnologia: 'Transversales',
    tecnologia: 'Docker + Dockerfile',
    sesion: 'Sesión 3 (Lun 17 nov)',
    tiempoMinutos: 60,
    resumen: 'Empaquetar una API en un "contenedor" para que funcione igual en cualquier computador, sin el clásico "en mi máquina sí servía".',
    secciones: [
      {
        key: 'investigacion',
        titulo: '¿Qué deben investigar? (antes de exponer)',
        icono: 'bi-journal-bookmark-fill',
        items: [
          'Explica qué es Docker y qué problema resuelve en el despliegue de software.',
          'Explica qué es una imagen y qué es un contenedor (dejando claro que no son lo mismo).',
          'Explica qué es un Dockerfile y qué hacen las instrucciones FROM, COPY, RUN y CMD.',
          'Explica qué diferencia hay entre Docker (contenedores) y una máquina virtual.'
        ]
      },
      {
        key: 'hacer',
        titulo: '¿Qué deben hacer? (construir y mostrar paso a paso)',
        icono: 'bi-code-square',
        items: [
          '1. Tomar una API sencilla (la del Tema 1 o 3).',
          '2. Escribir el Dockerfile paso a paso, explicando cada línea.',
          '3. Construir la imagen con "docker build".',
          '4. Levantar el contenedor con "docker run" y probar la API.',
          '5. Mostrar que la API responde correctamente desde el contenedor.'
        ]
      },
      {
        key: 'lograr',
        titulo: '¿Qué deben lograr que sus compañeros hagan? ("Ahora háganlo ustedes")',
        icono: 'bi-people-fill',
        items: [
          'Logran que los compañeros levanten el contenedor en su propia máquina con un solo comando y vean la API corriendo sin instalar entornos adicionales.'
        ]
      },
      {
        key: 'entregables',
        titulo: 'Entregables de la exposición',
        icono: 'bi-box-seam-fill',
        items: [
          'Dockerfile debidamente comentado en el repositorio.',
          'Imagen publicada (Docker Hub) o instrucciones claras para construirla.',
          'Demostración del contenedor ejecutándose en vivo.'
        ]
      },
      {
        key: 'tiempoPreguntas',
        titulo: 'Manejo del tiempo y Sesión de preguntas',
        icono: 'bi-stopwatch-fill',
        items: [
          'Cumplimiento y buen aprovechamiento del tiempo asignado (base 60 min: Intro 10m, Demo en vivo 25m, Práctica compañeros 20m, Preguntas 5m) con ritmo pedagógico.',
          'Dominio técnico y claridad al responder preguntas de los compañeros y del instructor.'
        ]
      }
    ]
  },
  {
    id: 11,
    titulo: 'Microservicios (trabajo en grupo)',
    categoria: 'Arquitectura',
    grupoTecnologia: 'Transversales',
    tecnologia: 'Spring Boot (dos servicios) o Node.js',
    sesion: 'Sesión 3 (Lun 17 nov)',
    tiempoMinutos: 75,
    resumen: 'Dividir una aplicación en dos servicios pequeños e independientes que se comunican entre sí por API (por ejemplo, "productos" y "pedidos").',
    secciones: [
      {
        key: 'investigacion',
        titulo: '¿Qué deben investigar? (antes de exponer)',
        icono: 'bi-journal-bookmark-fill',
        items: [
          'Explica qué es una arquitectura de microservicios y en qué se diferencia de un monolito.',
          'Explica cómo se comunican dos microservicios entre sí (HTTP/REST, JSON).',
          'Explica qué ventajas y qué complicaciones trae dividir una aplicación en servicios.',
          'Explica conceptualmente qué es un API Gateway (mencionar, sin necesidad de implementar).'
        ]
      },
      {
        key: 'hacer',
        titulo: '¿Qué deben hacer? (construir y mostrar paso a paso)',
        icono: 'bi-code-square',
        items: [
          '1. Crear el servicio de "productos" con su propio CRUD.',
          '2. Crear el servicio de "pedidos" por separado.',
          '3. Hacer que el servicio de pedidos consulte al de productos por API.',
          '4. Levantar los dos servicios a la vez y mostrar la petición que viaja de uno al otro.',
          '5. Explicar con criterio cuándo conviene (y cuándo no) separarlos.'
        ]
      },
      {
        key: 'lograr',
        titulo: '¿Qué deben lograr que sus compañeros hagan? ("Ahora háganlo ustedes")',
        icono: 'bi-people-fill',
        items: [
          'Logran que los compañeros sigan la traza de una petición que pasa de un servicio al otro y comprendan por qué están desacoplados.'
        ]
      },
      {
        key: 'entregables',
        titulo: 'Entregables de la exposición',
        icono: 'bi-box-seam-fill',
        items: [
          'Dos proyectos publicados en GitHub (servicio productos y servicio pedidos).',
          'Diagrama de arquitectura mostrando los dos servicios comunicándose.',
          'Demostración en vivo de ambos servicios interactuando.'
        ]
      },
      {
        key: 'tiempoPreguntas',
        titulo: 'Manejo del tiempo y Sesión de preguntas',
        icono: 'bi-stopwatch-fill',
        items: [
          'Cumplimiento y buen aprovechamiento del tiempo asignado (base 75 min para Microservicios: Intro 10m, Demo 35m, Práctica 25m, Preguntas 5m) cubriendo todas las etapas.',
          'Dominio técnico y claridad al responder preguntas de los compañeros y del instructor.'
        ]
      }
    ]
  },
  {
    id: 12,
    titulo: 'Consumir una API de IA (LLM)',
    categoria: 'IA aplicada',
    grupoTecnologia: 'Transversales',
    tecnologia: 'API de un modelo de IA (OpenAI, Gemini u otro) desde cualquier lenguaje',
    sesion: 'Sesión 3 (Lun 17 nov)',
    tiempoMinutos: 60,
    resumen: 'Construir una mini-app que envíe un texto a un modelo de inteligencia artificial y muestre la respuesta en pantalla.',
    secciones: [
      {
        key: 'investigacion',
        titulo: '¿Qué deben investigar? (antes de exponer)',
        icono: 'bi-journal-bookmark-fill',
        items: [
          'Explica qué es un LLM (Modelo Grande de Lenguaje).',
          'Explica qué es una API key y por qué NUNCA se debe publicar directamente en el código.',
          'Explica qué es un prompt y por qué cambia la respuesta según cómo se formule la instrucción.',
          'Explica qué son los tokens y por qué estas APIs suelen cobrar por uso.'
        ]
      },
      {
        key: 'hacer',
        titulo: '¿Qué deben hacer? (construir y mostrar paso a paso)',
        icono: 'bi-code-square',
        items: [
          '1. Obtener una API key del proveedor elegido y guardarla de forma segura en variable de entorno (.env).',
          '2. Crear una pantalla o consola donde el usuario escriba un texto.',
          '3. Enviar ese texto a la API de IA y recibir la respuesta.',
          '4. Mostrar la respuesta formateada en pantalla.',
          '5. Probar el mismo texto con prompts distintos y comparar las respuestas.'
        ]
      },
      {
        key: 'lograr',
        titulo: '¿Qué deben lograr que sus compañeros hagan? ("Ahora háganlo ustedes")',
        icono: 'bi-people-fill',
        items: [
          'Logran que los compañeros cambien el prompt (la instrucción) en vivo y comprueben cómo cambia la respuesta del modelo ("cómo se pregunta importa").'
        ]
      },
      {
        key: 'entregables',
        titulo: 'Entregables de la exposición',
        icono: 'bi-box-seam-fill',
        items: [
          'Proyecto en GitHub (verificando estrictamente que NO incluya la API key expuesta).',
          'Demostración en vivo enviando un prompt real.',
          'Ejemplos documentados de cómo cambia la respuesta según el prompt.'
        ]
      },
      {
        key: 'tiempoPreguntas',
        titulo: 'Manejo del tiempo y Sesión de preguntas',
        icono: 'bi-stopwatch-fill',
        items: [
          'Cumplimiento y buen aprovechamiento del tiempo asignado (base 60 min: Intro 10m, Demo en vivo 25m, Práctica compañeros 20m, Preguntas 5m) con ritmo pedagógico.',
          'Dominio técnico y claridad al responder preguntas de los compañeros y del instructor.'
        ]
      }
    ]
  }
];

