const catalogo = document.getElementById("catalogo");
const busqueda = document.getElementById("busqueda");
const filtroTipo = document.getElementById("filtroTipo");
const btnAleatorio = document.getElementById("btnAleatorio");
const pieTexto = document.getElementById("pieTexto");

const equipoUsuarioBox = document.getElementById("equipoUsuario");
const contadorUsuario = document.getElementById("contadorUsuario");
const btnLimpiarUsuario = document.getElementById("btnLimpiarUsuario");

const equiposRivalesBox = document.getElementById("equiposRivales");
const btnBatalla = document.getElementById("btnBatalla");
const btnResetTodo = document.getElementById("btnResetTodo");

const cinematica = document.getElementById("cinematica");
const estadoBatalla = document.getElementById("estadoBatalla");
const nombreA = document.getElementById("nombreA");
const nombreB = document.getElementById("nombreB");
const imgA = document.getElementById("imgA");
const imgB = document.getElementById("imgB");
const vidaA = document.getElementById("vidaA");
const vidaB = document.getElementById("vidaB");
const vidaTextoA = document.getElementById("vidaTextoA");
const vidaTextoB = document.getElementById("vidaTextoB");
const logBatalla = document.getElementById("logBatalla");
const rondaTexto = document.getElementById("rondaTexto");

let pokemones = [];
let pokemonesFiltrados = [];
let equipoUsuario = [];
let equiposRivales = [];
let rivalSeleccionado = null;

const idsPokemon = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 12,
    15, 18, 20, 24, 25, 26, 28, 31, 34, 36,
    38, 40, 45, 49, 51, 53, 55, 57, 59, 62,
    65, 68, 71, 73, 76, 78, 80, 82, 85, 87,
    89, 91, 94, 97, 99, 101, 103, 105, 106, 107,
    110, 112, 113, 115, 119, 121, 122, 124, 127, 128,
    130, 131, 132, 134, 135, 136, 137, 139, 141, 142,
    143, 149
];

async function cargarPokemones() {
    try {
        const promesas = idsPokemon.map(async (id) => {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const data = await res.json();

            return {
                id: data.id,
                nombre: data.name,
                imagen: data.sprites.other["official-artwork"].front_default || data.sprites.front_default,
                tipos: data.types.map(t => t.type.name),
                hp: data.stats.find(s => s.stat.name === "hp").base_stat,
                ataque: data.stats.find(s => s.stat.name === "attack").base_stat,
                defensa: data.stats.find(s => s.stat.name === "defense").base_stat,
                velocidad: data.stats.find(s => s.stat.name === "speed").base_stat,
                especial: data.stats.find(s => s.stat.name === "special-attack").base_stat,
                altura: data.height,
                peso: data.weight
            };
        });

        pokemones = await Promise.all(promesas);
        pokemonesFiltrados = [...pokemones];

        llenarTipos();
        generarEquiposRivales();
        renderizarEquipoUsuario();
        renderizarEquiposRivales();
        renderizarPokemones(pokemonesFiltrados);
    } catch (error) {
        console.error(error);
        catalogo.innerHTML = `<p class="mensaje">No se pudieron cargar los pokémons.</p>`;
    }
}

function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function traducirTipo(tipo) {
    const mapa = {
        grass: "planta",
        poison: "veneno",
        fire: "fuego",
        water: "agua",
        electric: "electrico",
        normal: "normal",
        fairy: "hada",
        flying: "volador",
        bug: "bicho",
        ground: "tierra",
        fighting: "lucha",
        psychic: "psiquico",
        rock: "roca",
        ice: "hielo",
        ghost: "fantasma"
    };
    return mapa[tipo] || tipo;
}

function claseTipo(tipo) {
    const mapa = {
        grass: "planta",
        poison: "veneno",
        fire: "fuego",
        water: "agua",
        electric: "electrico",
        normal: "normal",
        fairy: "hada",
        flying: "volador",
        bug: "bicho",
        ground: "tierra",
        fighting: "lucha",
        psychic: "psiquico",
        rock: "roca",
        ice: "hielo",
        ghost: "fantasma"
    };
    return mapa[tipo] || "normal";
}

function llenarTipos() {
    const tiposUnicos = [...new Set(pokemones.flatMap(p => p.tipos))].sort();

    tiposUnicos.forEach(tipo => {
        const option = document.createElement("option");
        option.value = tipo;
        option.textContent = capitalizar(traducirTipo(tipo));
        filtroTipo.appendChild(option);
    });
}

function calcularPoder(pokemon) {
    return pokemon.hp + pokemon.ataque + pokemon.defensa + pokemon.velocidad + pokemon.especial;
}

function generarCaracteristicas(pokemon) {
    return `
    Altura: ${(pokemon.altura / 10).toFixed(1)} m<br>
    Peso: ${(pokemon.peso / 10).toFixed(1)} kg<br>
    Poder base: ${calcularPoder(pokemon)}
  `;
}

function crearStat(nombre, valor) {
    const porcentaje = Math.min((valor / 180) * 100, 100);
    return `
    <div class="stat">
      <div class="stat-top">
        <span>${nombre}</span>
        <span>${valor}</span>
      </div>
      <div class="barra">
        <div class="relleno" style="width:${porcentaje}%"></div>
      </div>
    </div>
  `;
}

function estaEnMiEquipo(id) {
    return equipoUsuario.some(p => p.id === id);
}

function renderizarPokemones(lista) {
    if (!lista.length) {
        catalogo.innerHTML = `<p class="mensaje">No se encontraron pokémons.</p>`;
        return;
    }

    catalogo.innerHTML = lista.map(pokemon => `
    <div class="card">
      <div class="numero"><span>N.º</span> ${pokemon.id.toString().padStart(4, "0")}</div>

      <div class="imagen-box">
        <img src="${pokemon.imagen}" alt="${pokemon.nombre}">
      </div>

      <div class="nombre">${capitalizar(pokemon.nombre)}</div>

      <div class="tipos">
        ${pokemon.tipos.map(tipo => `
          <span class="tipo ${claseTipo(tipo)}">${capitalizar(traducirTipo(tipo))}</span>
        `).join("")}
      </div>

      <div class="caracteristicas">
        ${generarCaracteristicas(pokemon)}
      </div>

      <div class="stats">
        ${crearStat("HP", pokemon.hp)}
        ${crearStat("Ataque", pokemon.ataque)}
        ${crearStat("Defensa", pokemon.defensa)}
        ${crearStat("Velocidad", pokemon.velocidad)}
        ${crearStat("Especial", pokemon.especial)}
      </div>

      <button class="btn-seleccionar ${estaEnMiEquipo(pokemon.id) ? "activo" : ""}" onclick="seleccionarPokemonUsuario(${pokemon.id})">
        ${estaEnMiEquipo(pokemon.id) ? "En tu equipo" : "Agregar a mi equipo"}
      </button>
    </div>
  `).join("");

    pieTexto.textContent = `Mostrando ${lista.length} pokémon de 1ra generación sin legendarios.`;
}

window.seleccionarPokemonUsuario = function (id) {
    const pokemon = pokemones.find(p => p.id === id);
    if (!pokemon) return;

    if (estaEnMiEquipo(id)) {
        equipoUsuario = equipoUsuario.filter(p => p.id !== id);
    } else {
        if (equipoUsuario.length >= 6) {
            alert("Tu equipo ya tiene 6 pokémon.");
            return;
        }
        equipoUsuario.push(pokemon);
    }

    renderizarEquipoUsuario();
    renderizarPokemones(pokemonesFiltrados);
};

function renderizarEquipoUsuario() {
    let html = "";

    for (let i = 0; i < 6; i++) {
        const pokemon = equipoUsuario[i];

        if (pokemon) {
            html += `
        <div class="slot-mini">
          <img src="${pokemon.imagen}" alt="${pokemon.nombre}">
          <span>${capitalizar(pokemon.nombre)}</span>
        </div>
      `;
        } else {
            html += `
        <div class="slot-mini">
          <span>Vacío</span>
        </div>
      `;
        }
    }

    equipoUsuarioBox.innerHTML = html;
    contadorUsuario.textContent = `${equipoUsuario.length} / 6 seleccionados`;
}

function obtenerPokemonesDisponiblesParaRival() {
    return pokemones.filter(p => !equipoUsuario.some(u => u.id === p.id));
}

function mezclarArray(arr) {
    const copia = [...arr];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

function generarEquiposRivales() {
    const baseDisponibles = pokemones.length ? pokemones : [];
    equiposRivales = [];

    const nombres = [
        "Equipo Fuego",
        "Equipo Agua",
        "Equipo Trueno",
        "Equipo Sombra"
    ];

    for (let i = 0; i < 4; i++) {
        const mezcla = mezclarArray(baseDisponibles);
        const equipo = mezcla.slice(i * 6, i * 6 + 6);

        equiposRivales.push({
            id: i + 1,
            nombre: nombres[i],
            pokemones: equipo
        });
    }
}

function regenerarRivalesSinMiEquipo() {
    const disponibles = obtenerPokemonesDisponiblesParaRival();
    const nombres = [
        "Equipo Fuego",
        "Equipo Agua",
        "Equipo Trueno",
        "Equipo Sombra"
    ];

    if (disponibles.length < 24) {
        return;
    }

    const mezcla = mezclarArray(disponibles);
    equiposRivales = [];

    for (let i = 0; i < 4; i++) {
        equiposRivales.push({
            id: i + 1,
            nombre: nombres[i],
            pokemones: mezcla.slice(i * 6, i * 6 + 6)
        });
    }

    if (rivalSeleccionado) {
        rivalSeleccionado = equiposRivales.find(r => r.id === rivalSeleccionado.id) || null;
    }
}

function renderizarEquiposRivales() {
    equiposRivalesBox.innerHTML = equiposRivales.map(rival => `
    <div class="card-rival ${rivalSeleccionado && rivalSeleccionado.id === rival.id ? "activo" : ""}">
      <h4>${rival.nombre}</h4>

      <div class="rival-mini-grid">
        ${rival.pokemones.map(p => `
          <div class="rival-mini">
            <img src="${p.imagen}" alt="${p.nombre}">
            <span>${capitalizar(p.nombre)}</span>
          </div>
        `).join("")}
      </div>

      <button class="btn btn-secundario" onclick="seleccionarRival(${rival.id})">
        ${rivalSeleccionado && rivalSeleccionado.id === rival.id ? "Equipo elegido" : "Elegir rival"}
      </button>
    </div>
  `).join("");
}

window.seleccionarRival = function (id) {
    rivalSeleccionado = equiposRivales.find(r => r.id === id);
    renderizarEquiposRivales();
};

function aplicarFiltros() {
    const texto = busqueda.value.toLowerCase().trim();
    const tipoSeleccionado = filtroTipo.value;

    pokemonesFiltrados = pokemones.filter(pokemon => {
        const coincideNombre = pokemon.nombre.toLowerCase().includes(texto);
        const coincideTipo = !tipoSeleccionado || pokemon.tipos.includes(tipoSeleccionado);
        return coincideNombre && coincideTipo;
    });

    renderizarPokemones(pokemonesFiltrados);
}

function elegirAleatorio() {
    const disponibles = pokemones.filter(p => !estaEnMiEquipo(p.id));
    if (!disponibles.length) return;

    const random = disponibles[Math.floor(Math.random() * disponibles.length)];
    busqueda.value = random.nombre;
    aplicarFiltros();
}

function limpiarMiEquipo() {
    equipoUsuario = [];
    rivalSeleccionado = null;
    regenerarRivalesSinMiEquipo();
    renderizarEquipoUsuario();
    renderizarEquiposRivales();
    renderizarPokemones(pokemonesFiltrados);
}

function reiniciarTodo() {
    equipoUsuario = [];
    rivalSeleccionado = null;
    cinematica.classList.add("oculto");
    logBatalla.innerHTML = "";
    estadoBatalla.textContent = "Preparando combate...";
    busqueda.value = "";
    filtroTipo.value = "";
    pokemonesFiltrados = [...pokemones];
    generarEquiposRivales();
    renderizarEquipoUsuario();
    renderizarEquiposRivales();
    renderizarPokemones(pokemonesFiltrados);
}

function dormir(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function agregarLog(texto) {
    logBatalla.innerHTML += `<p>${texto}</p>`;
    logBatalla.scrollTop = logBatalla.scrollHeight;
}

function actualizarUIBatalla(pA, pB, hpA, hpB, turno, duelo, rivalNombre) {
    nombreA.textContent = `${capitalizar(pA.nombre)} - Tu equipo`;
    nombreB.textContent = `${capitalizar(pB.nombre)} - ${rivalNombre}`;

    imgA.src = pA.imagen;
    imgB.src = pB.imagen;

    const porcentajeA = Math.max((hpA / pA.hp) * 100, 0);
    const porcentajeB = Math.max((hpB / pB.hp) * 100, 0);

    vidaA.style.width = `${porcentajeA}%`;
    vidaB.style.width = `${porcentajeB}%`;

    vidaTextoA.textContent = `${Math.max(hpA, 0)} / ${pA.hp}`;
    vidaTextoB.textContent = `${Math.max(hpB, 0)} / ${pB.hp}`;

    rondaTexto.textContent = `Duelo ${duelo} - Turno ${turno}`;
}

function aplicarAnimacionGolpe(atacanteImg, defensorImg) {
    atacanteImg.classList.add("brillo");
    defensorImg.classList.add("golpe");

    setTimeout(() => {
        atacanteImg.classList.remove("brillo");
        defensorImg.classList.remove("golpe");
    }, 420);
}

function calcularDanio(atacante, defensor) {
    const base = atacante.ataque + Math.floor(atacante.especial / 2);
    const defensaReducida = Math.floor(defensor.defensa / 3);
    const random = Math.floor(Math.random() * 16) + 8;
    return Math.max(base - defensaReducida + random, 8);
}

async function dueloPokemon(pA, pB, numeroDuelo, rivalNombre) {
    let hpA = pA.hp;
    let hpB = pB.hp;
    let turno = 1;

    estadoBatalla.textContent = `Entrando al combate: ${capitalizar(pA.nombre)} vs ${capitalizar(pB.nombre)}`;
    actualizarUIBatalla(pA, pB, hpA, hpB, turno, numeroDuelo, rivalNombre);
    agregarLog(`<strong>Duelo ${numeroDuelo}:</strong> ${capitalizar(pA.nombre)} entra por tu equipo y ${capitalizar(pB.nombre)} por ${rivalNombre}.`);
    await dormir(1100);

    while (hpA > 0 && hpB > 0) {
        const primeroA = pA.velocidad >= pB.velocidad;

        if (primeroA) {
            const danioA = calcularDanio(pA, pB);
            aplicarAnimacionGolpe(imgA, imgB);
            hpB -= danioA;
            actualizarUIBatalla(pA, pB, hpA, hpB, turno, numeroDuelo, rivalNombre);
            agregarLog(`${capitalizar(pA.nombre)} ataca y le quita ${danioA} a ${capitalizar(pB.nombre)}.`);
            await dormir(950);

            if (hpB <= 0) break;

            const danioB = calcularDanio(pB, pA);
            aplicarAnimacionGolpe(imgB, imgA);
            hpA -= danioB;
            actualizarUIBatalla(pA, pB, hpA, hpB, turno, numeroDuelo, rivalNombre);
            agregarLog(`${capitalizar(pB.nombre)} responde con ${danioB} de daño.`);
            await dormir(950);
        } else {
            const danioB = calcularDanio(pB, pA);
            aplicarAnimacionGolpe(imgB, imgA);
            hpA -= danioB;
            actualizarUIBatalla(pA, pB, hpA, hpB, turno, numeroDuelo, rivalNombre);
            agregarLog(`${capitalizar(pB.nombre)} pega primero y hace ${danioB} de daño.`);
            await dormir(950);

            if (hpA <= 0) break;

            const danioA = calcularDanio(pA, pB);
            aplicarAnimacionGolpe(imgA, imgB);
            hpB -= danioA;
            actualizarUIBatalla(pA, pB, hpA, hpB, turno, numeroDuelo, rivalNombre);
            agregarLog(`${capitalizar(pA.nombre)} contraataca con ${danioA} de daño.`);
            await dormir(950);
        }

        turno++;
    }

    if (hpA > 0) {
        agregarLog(`<strong>${capitalizar(pA.nombre)} gana este duelo.</strong>`);
        await dormir(1000);
        return "A";
    } else {
        agregarLog(`<strong>${capitalizar(pB.nombre)} gana este duelo.</strong>`);
        await dormir(1000);
        return "B";
    }
}

async function iniciarBatalla() {
    if (equipoUsuario.length < 6) {
        alert("Primero escoge tus 6 pokémon.");
        return;
    }

    regenerarRivalesSinMiEquipo();
    renderizarEquiposRivales();

    if (!rivalSeleccionado) {
        alert("Escoge un equipo rival.");
        return;
    }

    const rivalActual = equiposRivales.find(r => r.id === rivalSeleccionado.id);

    if (!rivalActual || rivalActual.pokemones.length < 6) {
        alert("El equipo rival no está completo.");
        return;
    }

    cinematica.classList.remove("oculto");
    cinematica.scrollIntoView({ behavior: "smooth" });

    logBatalla.innerHTML = "";
    agregarLog("<strong>Comienza la batalla.</strong>");
    estadoBatalla.textContent = "Presentando equipos...";
    await dormir(900);

    agregarLog(`Tu equipo: ${equipoUsuario.map(p => capitalizar(p.nombre)).join(", ")}.`);
    await dormir(900);
    agregarLog(`${rivalActual.nombre}: ${rivalActual.pokemones.map(p => capitalizar(p.nombre)).join(", ")}.`);
    await dormir(1200);

    let victoriasUsuario = 0;
    let victoriasRival = 0;

    for (let i = 0; i < 6; i++) {
        const ganador = await dueloPokemon(
            equipoUsuario[i],
            rivalActual.pokemones[i],
            i + 1,
            rivalActual.nombre
        );

        if (ganador === "A") {
            victoriasUsuario++;
        } else {
            victoriasRival++;
        }

        agregarLog(`Marcador actual → Tú ${victoriasUsuario} - ${victoriasRival} ${rivalActual.nombre}`);
        estadoBatalla.textContent = `Marcador: Tú ${victoriasUsuario} - ${victoriasRival} ${rivalActual.nombre}`;
        await dormir(1200);
    }

    if (victoriasUsuario > victoriasRival) {
        agregarLog(`<strong>🔥 Ganaste la batalla final ${victoriasUsuario} a ${victoriasRival}.</strong>`);
        estadoBatalla.textContent = "Ganador final: Tu equipo";
    } else if (victoriasRival > victoriasUsuario) {
        agregarLog(`<strong>💀 Perdiste la batalla. ${rivalActual.nombre} ganó ${victoriasRival} a ${victoriasUsuario}.</strong>`);
        estadoBatalla.textContent = `Ganador final: ${rivalActual.nombre}`;
    } else {
        agregarLog(`<strong>⚔️ Empate total. La batalla termina ${victoriasUsuario} a ${victoriasRival}.</strong>`);
        estadoBatalla.textContent = "Resultado final: Empate";
    }
}

btnAleatorio.addEventListener("click", elegirAleatorio);
busqueda.addEventListener("input", aplicarFiltros);
filtroTipo.addEventListener("change", aplicarFiltros);
btnLimpiarUsuario.addEventListener("click", limpiarMiEquipo);
btnBatalla.addEventListener("click", iniciarBatalla);
btnResetTodo.addEventListener("click", reiniciarTodo);

cargarPokemones();
