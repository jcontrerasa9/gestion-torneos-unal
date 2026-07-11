# Instrucciones para agentes

Este repositorio se usa como una aplicación separada: React para el frontend y Laravel para el backend/API. Mantén los cambios enfocados en el dominio y preserva la estructura modular existente.

## Alcance del producto

- Los dominios principales son autenticación, torneos, equipos, solicitudes de jugadores, partidos, disciplina, tabla de posiciones y goleadores.
- Toma los requerimientos funcionales y no funcionales como obligatorios. Prioriza el comportamiento que soporte RF-01 a RF-12 y AF-2 a PO-2.
- Prefiere reglas de negocio aplicadas en la aplicación y en la base de datos, no por intervención manual.
- Asume que Laravel expone principalmente endpoints de API para el cliente React, salvo que una tarea pida explícitamente vistas renderizadas por servidor.

## Convenciones del proyecto

- Mantén el backend organizado por dominio en `app/Http/Controllers/*` y `app/Models/*`.
- Sigue el estilo existente de controladores de recurso: valida la entrada, persiste con Eloquent y luego retorna JSON o la respuesta HTTP mínima apropiada para la API.
- Usa redirecciones, vistas Blade o mensajes flash solo cuando una tarea involucre explícitamente páginas renderizadas por Laravel.
- Usa migraciones para cada cambio de esquema; no edites la base de datos manualmente.
- Conserva las convenciones de `fillable` y casting ya usadas en el código.
- Usa transacciones en operaciones que toquen varias tablas, especialmente resultados de partidos, tabla de posiciones, suspensiones y aprobaciones de jugadores.
- Mantén relaciones y restricciones alineadas con el esquema, incluyendo la regla de participación única de un equipo por torneo y la regla de un jugador por equipo en un torneo.

## Validación y flujo de trabajo

- Revisa el README para ver la configuración general y los comandos de ejecución antes de agregar nuevas instrucciones: [README.md](README.md).
- Prefiere los scripts definidos en [composer.json](composer.json) y [package.json](package.json) para desarrollo y pruebas.
- Ejecuta el comando de prueba o validación más acotado posible después de cada cambio, cuando aplique.

## Recordatorios de seguridad

- No hashees las contraseñas dos veces; respeta el casting ya definido en los modelos.
- No rompas las actualizaciones automáticas de tabla de posiciones, goleadores o suspensiones.
- Mantén las acciones irreversibles explícitas y confirmadas en la interfaz.