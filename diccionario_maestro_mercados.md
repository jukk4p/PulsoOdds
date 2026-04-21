# 📚 Diccionario Maestro de Mercados - PulsoOdds

Este documento es la fuente de verdad definitiva para la traducción y localización de los mercados de apuestas obtenidos de la API (Bet365/Betfair/Pinnacle).

## 🚀 Mercados Principales (Main)

| Literal API | Nombre Español (UI) | Descripción |
| :--- | :--- | :--- |
| **ML** | **Ganador del Partido (1X2)** | El clásico mercado de victoria local, empate o visitante. |
| **Double Chance** | **Doble Oportunidad** | Cubre dos de los tres resultados posibles (1X, 12, X2). |
| **Draw No Bet** | **Empate Apuesta No Válida** | Devuelve el dinero si el partido termina en empate. |
| **Spread** | **Hándicap Asiático** | El mercado de ventaja/desventaja de goles para nivelar cuotas. |
| **Asian Handicap** | **Hándicap Asiático** | Variante explícita del Handicap. |
| **Totals** | **Total de Goles (Over/Under)** | Mercado general de más/menos goles en el partido. |
| **Goals Over/Under** | **Goles Más/Menos** | Variante de totales de goles. |
| **Alternative Total Goals** | **Total de Goles (Alternativo)** | Líneas adicionales de goles. |
| **Both Teams To Score** | **Ambos Equipos Anotan** | El famoso "Ambos Marcan" (BTTS). |
| **1st Half - Both Teams to Score** | **Ambos Marcan (1ª Parte)** | BTTS limitado al primer tiempo. |
| **Half Time Result** | **Resultado al Descanso** | Ganador del primer tiempo. |
| **Spread HT** | **Hándicap Asiático (1ª Parte)** | Hándicap solo para los primeros 45 minutos. |
| **Totals HT** | **Total de Goles (1ª Parte)** | Over/Under del primer tiempo. |
| **European Handicap** | **Hándicap Europeo** | Hándicap de tres opciones (incluye empate). |
| **Exact Total Goals** | **Total Exacto de Goles** | Cantidad exacta de goles marcados. |
| **Number of Goals In Match** | **Número de Goles** | Rango o número total de goles. |

## 🚩 Córners (Saques de Esquina)

| Literal API | Nombre Español (UI) | Categoría |
| :--- | :--- | :--- |
| **Corners** | **Saques de Esquina** | Mercado general de córners. |
| **Asian Corners** | **Córners Asiáticos** | Hándicap/Totales asiáticos de saques de esquina. |
| **Total Corners** | **Total de Córners** | Suma total de saques de esquina. |
| **Corners Totals** | **Total de Córners (O/U)** | Más/Menos córners en el partido. |
| **Corners Totals HT** | **Córners (1ª Parte)** | Córners en la primera mitad. |
| **Corners Race** | **Carrera a Córners** | Quién llega primero a X número de córners. |
| **Corners Spread** | **Hándicap de Córners** | Ventaja/Desventaja en saques de esquina. |
| **Corner Handicap** | **Hándicap de Córners** | Variante de hándicap. |
| **Team Corners Home** | **Córners Local** | Saques de esquina del equipo de casa. |
| **Team Corners Away** | **Córners Visitante** | Saques de esquina del equipo de fuera. |

## 🟨 Tarjetas (Cartulinas)

| Literal API | Nombre Español (UI) | Categoría |
| :--- | :--- | :--- |
| **Number of Cards In Match** | **Total de Tarjetas** | Más/menos tarjetas en el partido. |
| **Asian Total Cards** | **Tarjetas Asiáticas** | Totales asiáticos para cubrir líneas decimales. |
| **Card Handicap** | **Hándicap de Tarjetas** | Ventaja/Desventaja en amonestaciones. |
| **Player to be Booked** | **Jugador Amonestado** | Apuesta a que un jugador recibirá tarjeta. |
| **Player Cards** | **Tarjetas de Jugador** | Mercado específico de amonestaciones. |
| **Team Cards Home** | **Tarjetas Local** | Amonestaciones del equipo de casa. |
| **Team Cards Away** | **Tarjetas Visitante** | Amonestaciones del equipo visitante. |

## ⚽ Jugadores (Player Props)

| Literal API | Nombre Español (UI) | Descripción |
| :--- | :--- | :--- |
| **Anytime Goalscorer** | **Jugador Anota (Cualquier momento)** | Goleador en cualquier minuto del partido. |
| **First Goalscorer** | **Primer Goleador** | Jugador que abre el marcador. |
| **Team Goalscorer** | **Goleador del Equipo** | Quién marca para un equipo específico. |
| **Player Shots** | **Remates de Jugador** | Intentos de disparo totales. |
| **Player Shots on Target** | **Remates a Puerta (Jugador)** | Disparos que van entre los tres palos. |
| **Player Passes** | **Pases de Jugador** | Cantidad de pases realizados. |
| **Player Tackles** | **Entradas de Jugador** | Robos de balón o tackles. |
| **Player Fouls Committed** | **Faltas Cometidas (Jugador)** | Infracciones del jugador. |
| **Player To Be Fouled** | **Jugador Recibe Falta** | Infracciones recibidas por el jugador. |
| **Player To Score or Assist** | **Gol o Asistencia (Jugador)** | Contribución directa a gol. |

## 📊 Estadísticas de Equipo y Especiales

| Literal API | Nombre Español (UI) | Categoría |
| :--- | :--- | :--- |
| **Team Total Goals Home** | **Goles Local (O/U)** | Más/Menos goles del equipo de casa. |
| **Team Total Goals Away** | **Goles Visitante (O/U)** | Más/Menos goles del equipo visitante. |
| **Match Shots** | **Remates Totales** | Disparos de ambos equipos. |
| **Match Shots on Target** | **Remates a Puerta Totales** | Disparos a puerta de ambos equipos. |
| **Match Offsides** | **Fueras de Juego** | Posiciones antirreglamentarias totales. |
| **Goalkeeper Saves** | **Paradas del Portero** | Atajadas del guardameta. |
| **Goal Method** | **Método del Gol** | De cabeza, fuera del área, etc. |
| **First 10 Minutes (00:00 - 09:59)** | **Primeros 10 Minutos** | Eventos en el tramo inicial. |

---
*Notas: Los literales en negrita son los más comunes para el bot de n8n. Este diccionario debe actualizarse si la API añade nuevos mercados.*
