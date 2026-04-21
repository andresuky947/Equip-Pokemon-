const catalogo = document.getElementById("catalogo");
const busqueda = document.getElementById("busqueda");
const filtroTipo = document.getElementById("filtroTipo");
const sorpresa = document.getElementById("sorpresa");
const pieTexto = document.getElementById("pieTexto");

const slot1 = document.getElementById("slot1");
const slot2 = document.getElementById("slot2");
const btnPelea = document.getElementById("btnPelea");
const btnLimpiar = document.getElementById("btnLimpiar");
const resultadoPelea = document.getElementById("resultadoPelea");

let pokemones = [];
let pokemonesFiltrados = [];
let seleccionados = [];

// 6 pokémon de 1ra generación
const idsPokemon = [1, 4, 7, 25, 133, 39];

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
        altura: data.height,
        peso: data.weight
      };
    });

    pokemones = await Promise.all(promesas);
    pokemonesFiltrados = [...pokemones];

    llenarTipos();
    renderizarPokemones(pokemonesFiltrados);
  } catch (error) {
    console.error("Error cargando pokémons:", error);
    catalogo.innerHTML = `<p class="mensaje">No se pudieron cargar los pokémons.</p>`;
  }
}

function traducirTipo(tipo) {
  const traducciones = {
    grass: "planta",
    poison: "veneno",
    fire: "fuego",
    water: "agua",
    electric: "electrico",
    normal: "normal",
    fairy: "hada"
  };
  return traducciones[tipo] || tipo;
}

function claseTipo(tipo) {
  const clases = {
    grass: "planta",
    poison: "veneno",
    fire: "fuego",
    water: "agua",
    electric: "electrico",
    normal: "normal",
    fairy: "hada"
  };
  return clases[tipo] || "normal";
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function llenarTipos() {
  const tiposUnicos = [...new Set(pokemones.flatMap(p => p.tipos))];

  tiposUnicos.forEach(tipo => {
    const option = document.createElement("option");
    option.value = tipo;
    option.textContent = capitalizar(traducirTipo(tipo));
    filtroTipo.appendChild(option);
  });
}

function generarCaracteristicas(pokemon) {
  return `
    Altura: ${pokemon.altura / 10} m<br>
    Peso: ${pokemon.peso / 10} kg<br>
    Poder base: ${pokemon.hp + pokemon.ataque + pokemon.defensa + pokemon.velocidad}
  `;
}

function crearStat(nombre, valor) {
  const porcentaje = Math.min((valor / 150) * 100, 100);
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

function estaSeleccionado(id) {
  return seleccionados.some(p => p.id === id);
}

function renderizarPokemones(lista) {
  if (lista.length === 0) {
    catalogo.innerHTML = `<p class="mensaje">No se encontraron pokémons.</p>`;
    pieTexto.textContent = "Mostrando 0 pokémon.";
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
      </div>

      <button class="btn-seleccionar ${estaSeleccionado(pokemon.id) ? 'activo' : ''}" onclick="seleccionarPokemon(${pokemon.id})">
        ${estaSeleccionado(pokemon.id) ? 'Seleccionado' : 'Elegir para pelea'}
      </button>
    </div>
  `).join("");

  pieTexto.textContent = `Mostrando ${lista.length} pokémon de la 1ra generación.`;
}

window.seleccionarPokemon = function(id) {
  const pokemon = pokemones.find(p => p.id === id);
  if (!pokemon) return;

  const yaExiste = seleccionados.some(p => p.id === id);

  if (yaExiste) {
    seleccionados = seleccionados.filter(p => p.id !== id);
  } else {
    if (seleccionados.length >= 2) {
      alert("Ya seleccionaste 2 pokémon. Primero limpia o quita uno.");
      return;
    }
    seleccionados.push(pokemon);
  }

  actualizarSlots();
  renderizarPokemones(pokemonesFiltrados);
};

function actualizarSlots() {
  slot1.innerHTML = `
    <strong>Pokémon 1</strong>
    <span>${seleccionados[0] ? capitalizar(seleccionados[0].nombre) + " | Poder: " + calcularPoder(seleccionados[0]) : "No has seleccionado nada todavía"}</span>
  `;

  slot2.innerHTML = `
    <strong>Pokémon 2</strong>
    <span>${seleccionados[1] ? capitalizar(seleccionados[1].nombre) + " | Poder: " + calcularPoder(seleccionados[1]) : "No has seleccionado nada todavía"}</span>
  `;
}

function calcularPoder(pokemon) {
  return pokemon.hp + pokemon.ataque + pokemon.defensa + pokemon.velocidad;
}

function pelear() {
  if (seleccionados.length < 2) {
    alert("Escoge 2 pokémon primero.");
    return;
  }

  const p1 = seleccionados[0];
  const p2 = seleccionados[1];

  const poder1 = calcularPoder(p1) + Math.floor(Math.random() * 30);
  const poder2 = calcularPoder(p2) + Math.floor(Math.random() * 30);

  let texto = "";

  if (poder1 > poder2) {
    texto = `
      <strong>${capitalizar(p1.nombre)}</strong> ganó la pelea.<br>
      Poder final: ${poder1} vs ${poder2}.<br>
      Su ataque y resistencia pudieron más esta vez.
    `;
  } else if (poder2 > poder1) {
    texto = `
      <strong>${capitalizar(p2.nombre)}</strong> ganó la pelea.<br>
      Poder final: ${poder2} vs ${poder1}.<br>
      Se vio más fuerte en este combate.
    `;
  } else {
    texto = `
      <strong>Empate.</strong><br>
      Los dos pokémon estuvieron muy parejos con ${poder1} de poder.
    `;
  }

  resultadoPelea.style.display = "block";
  resultadoPelea.innerHTML = texto;
}

function limpiarSeleccion() {
  seleccionados = [];
  resultadoPelea.style.display = "none";
  resultadoPelea.innerHTML = "";
  actualizarSlots();
  renderizarPokemones(pokemonesFiltrados);
}

function aplicarFiltros() {
  const texto = busqueda.value.toLowerCase().trim();
  const tipoSeleccionado = filtroTipo.value;

  pokemonesFiltrados = pokemones.filter(pokemon => {
    const coincideNombre = pokemon.nombre.toLowerCase().includes(texto);
    const coincideTipo = tipoSeleccionado === "" || pokemon.tipos.includes(tipoSeleccionado);
    return coincideNombre && coincideTipo;
  });

  renderizarPokemones(pokemonesFiltrados);
}

function pokemonAleatorio() {
  const random = pokemones[Math.floor(Math.random() * pokemones.length)];
  busqueda.value = random.nombre;
  aplicarFiltros();
}

busqueda.addEventListener("input", aplicarFiltros);
filtroTipo.addEventListener("change", aplicarFiltros);
sorpresa.addEventListener("click", pokemonAleatorio);
btnPelea.addEventListener("click", pelear);
btnLimpiar.addEventListener("click", limpiarSeleccion);

cargarPokemones();
