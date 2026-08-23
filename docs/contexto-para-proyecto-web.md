# Contexto del lado de código para el Proyecto web

> Bloque para pegar en el Proyecto de Claude.ai "PROYECTO IKIGAIER". Lleva al lado
> web lo que hoy solo existe en el código, para que pueda ayudar sin adivinar.
> Espejo inverso de `docs/proyecto-ikigaier.md` (que trajo la marca/negocio al código).

---

Contexto del lado de código de IKIGAIER (para que me ayudes desde este Proyecto sabiendo qué está ya construido).

## Dónde vive el código
- Repo real: **ikicard-app** (github.com/manelruedabcn/ikicard-app). NO se llama "epitaxy": donde tus documentos digan "epitaxy", es esto.
- Es la web/app pública (dominio ikigaier.com) y todas las herramientas interactivas.
- Stack: Next.js 14 (App Router) + React + TypeScript, Supabase (auth, Postgres con RLS, Storage), next-intl para ES/EN, Resend para email, jsPDF/html2canvas para exportar informes a PDF. Se despliega desde GitHub.

## Cómo funciona la plataforma
- Es una plataforma **por permisos**: cada usuario desbloquea herramientas; el dashboard es dinámico por usuario.
- El acceso se resuelve en un único punto (función SQL `get_my_tools()`), no con condicionales sueltos. Se crece añadiendo módulos, no parcheando.
- Todo con RLS (cada usuario solo ve lo suyo). La migración de datos va siempre antes que el código.
- Todo el contenido es **bilingüe ES/EN**: el texto vive en ficheros TypeScript con "getters" por idioma; la lógica (puntuaciones, cálculos) va sobre códigos independientes del idioma. El idioma sale de la URL (/es/... o /en/...).

## Herramientas ya construidas (todas funcionando)
- **PASO** (/paso) — base DISC oculta. Devuelve "cómo caminas" como una comparación (no una etiqueta). YA EN PRODUCCIÓN. Tiene captura de email (lead magnet), informe por email con enlace, exportación a PDF, y registra tests anónimos separados de los logueados para email marketing.
- **Las cuatro estrellas** (/estrellas) — test de 20 frases, 4 estilos (explorador, comunicador, protector, visionario). Devuelve tu estilo dominante. "Cómo eres en el mundo".
- **CAMINO** (/camino) — 6 orientaciones profesionales (p. ej. Constructor, Analista, Mentor…). Devuelve tu orientación dominante. "Tus capacidades".
- **Máscaras** (/mascaras) — las 7 máscaras (Exigente, Controladora, Manipuladora, Jueza, Complaciente, Víctima, Impostora). Devuelve la dominante + top 3 + el miedo debajo, con ejercicio de reflexión y exportación a PDF. "Qué te frena hoy".
- **IKIBOARD** (/ikiboard) — EL PROYECTO FINAL. Ver abajo.
- Además, ya activos: **Taller**, **Viaje** (recorrido de 21 días; un día no rellenado se pierde a propósito), **Oráculo**, **IKICARD**.

## IKIBOARD = el proyecto final ("el libro de fotos de tu futuro")
- Es el destino del embudo, no una herramienta más. Todas las anteriores lo alimentan.
- Lee lo que el usuario ya descubrió (PASO, estrellas, CAMINO, máscaras) SIN repetir tests. Cruza estilo × orientación × máscara en un borrador determinista (cero IA).
- Produce dos salidas: un ÁLBUM (4 ámbitos: Cuerpo y vida, Vínculos, Lo material, Vocación, con el propósito presidiendo; cada foto lleva una frase en presente y "qué das con eso") y un MAPA "para volver a ti" exportable a PDF.
- Recorrido: la tierra deseada → ver claro (lo que amas / se te da bien / tu entorno necesita / puede sostenerte) → propósito en una frase → quién estás siendo → lo que das → lo que te frena (enlaza con Máscaras) → un paso concreto.

## Voz y bases (igual que en el resto del universo)
- Todo el copy en la voz de Manel: calma, honesta, sin tono publicitario, entendible a la primera, nada etéreo.
- Las bases (DISC, cábala, PNL, las 4 fases Despertar/Descender/Atravesar/Retornar) sostienen por debajo y NUNCA se nombran al usuario.

## Desajuste pendiente de decidir (paleta)
- La marca "oficial" del mazo es negro (#0A0A0A) + oro (#D4B26A) como ancla. La app hoy usa fondo crema (#FDFBF7) + acento terracota (#c2866b). La tipografía sí coincide (Inter + Cormorant Garamond). No se ha cambiado nada; hay que decidir si acercar la web al negro+oro o mantener lo cálido.

Con esto: dime en qué me puedes ayudar desde aquí (copy, estructura de páginas, funnel, precios, textos de producto) sabiendo que estas herramientas ya existen y no hay que reinventarlas.
```
