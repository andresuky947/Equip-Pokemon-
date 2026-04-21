const catalogo = document.getElementById("catalogo");
const busqueda = document.getElementById("busqueda");
const filtroTipo = document.getElementById("filtroTipo");

let pokemones = [];
let pokemonesFiltrados = [];

async function obtenerPokemonesKantoSinLegendarios() {
    try {
        catalogo.innerHTML = `<p class="mensaje">Cargando pokémons...</p>`;

        const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
        const data = await res.json();

        const promesas = data.results.map(async (pokemon, index) => {
            const id = index + 1;

            const [detalleRes, especieRes] = await Promise.all([
                fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
                fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
            ]);

            const detalle = await detalleRes.json();
            const especie = await especieRes.json();

            if (!especie.is_legendary && !especie.is_mythical) {
                return {
                    id: detalle.id,
                    nombre: detalle.name,
                    imagen: detalle.sprites.other["official-artwork"].front_default || detalle.sprites.front_default,
                    tipos: detalle.types.map(t => t.type.name)
                };
            }

            return null;
        });

        const resultados = await Promise.all(promesas);

        pokemones = resultados.filter(p => p !== null);
        pokemonesFiltrados = [...pokemones];

        llenarFiltroTipos();
        renderizarPokemones(pokemonesFiltrados);

    } catch (error) {
        console.error(error);
        catalogo.innerHTML = `<p class="mensaje">Hubo un error cargando el catálogo.</p>`;
    }
}

function renderizarPokemones(lista) {
    if (lista.length === 0) {
        catalogo.innerHTML = `<p class="mensaje">No se encontraron pokémons.</p>`;
        return;
    }

    catalogo.innerHTML = lista.map(pokemon => `
    <div class="card">
      <img src="${pokemon.imagen}" alt="${pokemon.nombre}">
      <p class="numero">#${pokemon.id.toString().padStart(3, "0")}</p>
      <h3>${pokemon.nombre}</h3>
      <div class="tipos">
        ${pokemon.tipos.map(tipo => `<span class="tipo">${tipo}</span>`).join("")}
      </div>
    </div>
  `).join("");
}

function llenarFiltroTipos() {
    const tiposUnicos = [...new Set(pokemones.flatMap(p => p.tipos))].sort();

    tiposUnicos.forEach(tipo => {
        const option = document.createElement("option");
        option.value = tipo;
        option.textContent = tipo;
        filtroTipo.appendChild(option);
    });
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

busqueda.addEventListener("input", aplicarFiltros);
filtroTipo.addEventListener("change", aplicarFiltros);

obtenerPokemonesKantoSinLegendarios();