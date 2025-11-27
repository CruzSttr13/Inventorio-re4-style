# 💼 Inventorio — Inventario tipo *Resident Evil 4*

![Estado del Proyecto](https://img.shields.io/badge/Estado-En%20desarrollo-yellow)
![Tecnologías](https://img.shields.io/badge/Tech-HTML%20%7C%20CSS%20%7C%20JS-blue)

**Demo (en progreso):** https://inventario-resident4.netlify.app/

> Proyecto inspirado en el sistema de inventario de *Resident Evil 4*.  
> **Advertencia honesta:** el proyecto funciona pero **todavía no está terminado**. Se está trabajando en mejoras, nuevas features y empaquetados nativos. Si buscas una versión final lista para publicar, aún no está — pero la base ya está madura para pruebas y aportes.

---

## ✨ Qué hay ahora (features actuales)

- **🖱️ Drag & Drop** — Arrastra y suelta objetos en la cuadrícula; el sistema valida espacio.  
- **🔄 Rotación de objetos** — Rota items para acomodarlos mejor (`R` o botón en pantalla).  
- **📱 Responsive** — Diseñado para escritorio y móviles (recomiendo usar en horizontal en móviles).  
- **✨ Auto-organización** — Botón *Ordenar* que intenta optimizar la colocación de objetos.  
- **🎲 Generador de loot** — Crea items aleatorios para probar combinaciones.  
- **🎨 Estética** — Tema oscuro, glassmorphism y microfeedback visual/táctil.

> Estado: funcional pero en desarrollo. Falta pulir accesibilidad, optimizaciones, más items, assets y empaquetado nativo.

---

## 🚀 Cómo probarlo (rápido)

1. Clona o descarga el repo.  
2. Abre `index.html` en un navegador moderno (Chrome, Firefox, Edge).  
   - Alternativa recomendada para desarrollo: sirve el proyecto con `live-server` o `python -m http.server` para evitar problemas con rutas.  
3. Usa `R` para rotar, `S` para ordenar, prueba el drag & drop y el generador de loot.

**Móvil:** funciona por toque/arrastre; gira el dispositivo a horizontal para mejor experiencia.

---

## 🎮 Controles

| Acción       | PC (Mouse/Teclado)        | Móvil (Táctil)       |
|--------------|---------------------------|----------------------|
| Mover        | Click izquierda + arrastrar | Tocar + arrastrar    |
| Rotar        | Tecla `R` / Botón "Rotar"  | Botón "Rotar"        |
| Ordenar      | Tecla `S` / Botón "Ordenar"| Botón "Ordenar"      |
| Desordenar   | Botón "Desordenar"         | Botón "Desordenar"   |

---

## 🛠️ Tecnologías

- **HTML5** — estructura semántica.  
- **CSS3** — variables, Grid/Flexbox, animaciones y glassmorphism.  
- **JavaScript (vanilla)** — lógica de colisiones en cuadrícula, eventos táctiles/ratón, algoritmos de auto-organización.

---

## 🗂️ Estructura del proyecto

```text
/
├── index.html      # Estructura principal
├── styles.css      # Estilos y animaciones
├── script.js       # Lógica del inventario
└── README.md       # Documentación
