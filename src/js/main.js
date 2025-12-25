import { Carrito } from "./Carrito.mjs";

const IMG_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BATCH_SIZE = 8;

const OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5NjlhNTc4MmNmOWU0ZmI4Yjg2NGZhNzNkMDI2YTc3OCIsIm5iZiI6MTc2NDA3NjM5Ny4wNTIsInN1YiI6IjY5MjVhYjZkOTI3NDAxMmRiMDMwYzdjZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.6YtDu1GrVQH8bODUtBVEfjmDeTFidB9la4tbAkM4j88'
    }
};

// Variables globales
let allContent = [];       // Movies o series cargadas
let filteredContent = [];  // Contenido filtrado
let genresMap = {};
let displayedCount = 0;
let apiPage = 1;
let isFetching = false;

// Determina si estamos en la página de series o películas
const isSeriesPage = window.location.pathname.includes("series.html");
const API_TYPE = isSeriesPage ? "tv" : "movie";
const FIELD_TITLE = isSeriesPage ? "name" : "title";
const FIELD_DATE = isSeriesPage ? "first_air_date" : "release_date";

/**
 * Crea una tarjeta de película o serie utilizando manipulación del DOM
 * @param {Object} item Un objeto de tipo película o serie (TMDB)
 * @returns {HTMLElement} Un nodo DOM con el contenido de una tarjeta siguiendo BEM
 */
const CreaCard = (item) => {
    // 1. Configuración de datos iniciales
    const posterPath = item.poster_path ? `${IMG_BASE_URL}${item.poster_path}` : 'assets/no-poster.jpg';
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    const title = item[FIELD_TITLE] || 'Sin título';
    const date = item[FIELD_DATE] ? item[FIELD_DATE].substring(0, 4) : 'N/A';

    // 2. Contenedor principal (article)
    const card = document.createElement('article');
    card.className = 'movie-card';
    card.dataset.id = item.id;

    // --- SECCIÓN: POSTER WRAPPER ---
    const posterWrapper = document.createElement('div');
    posterWrapper.className = 'movie-card__poster-wrapper';

    const img = document.createElement('img');
    img.src = posterPath;
    img.alt = title;
    img.className = 'movie-card__poster';
    img.loading = 'lazy';

    const badge = document.createElement('div');
    badge.className = 'movie-card__badge pulse-neon';
    badge.textContent = rating;

    posterWrapper.append(img, badge);

    // --- SECCIÓN: CONTENIDO ---
    const content = document.createElement('div');
    content.className = 'movie-card__content';

    const h3 = document.createElement('h3');
    h3.className = 'movie-card__title';
    h3.textContent = title;

    // --- SECCIÓN: INFO/FOOTER ---
    const infoContainer = document.createElement('div');

    const spanDate = document.createElement('span');
    spanDate.textContent = date;

    const button = document.createElement('button');
    button.className = 'btn btn--neon movie-card__action';
    button.textContent = '+ CARRITO';

    const price = document.createElement('span');
    price.className = 'movie-card__price';
    price.textContent = ' 3.99 €';
    button.appendChild(price);

    // 3. Ensamblaje final
    infoContainer.append(spanDate, button);
    content.append(h3, infoContainer);
    card.append(posterWrapper, content);

    return card;
}

/**
 * Muestra el siguiente bloque de contenido
 * @param {boolean} reset Si es true, limpia el contenedor antes de añadir
 */
const DisplayNextBatch = (reset = false) => {
    const contenedor = document.getElementById("productos");

    if (reset) {
        contenedor.innerHTML = "";
        displayedCount = 0;
    }

    const nextBatch = filteredContent.slice(displayedCount, displayedCount + BATCH_SIZE);

    // Si no hay nada en el pool filtrado que mostrar, y no hay filtro de texto/género activo,
    // intentamos cargar más de la API.
    if (nextBatch.length === 0 && displayedCount >= filteredContent.length) {
        const val = document.getElementById("valor")?.value;
        const gen = document.getElementById("genero")?.value;
        const isFiltering = val !== "" || gen !== "";

        if (!isFiltering) {
            LoadMoreFromAPI();
            return;
        }
    }

    nextBatch.forEach(item => {
        contenedor.appendChild(CreaCard(item));
    });

    displayedCount += nextBatch.length;
}

/**
 * Carga más contenido de la API de TMDB
 */
const LoadMoreFromAPI = () => {
    if (isFetching) return;
    isFetching = true;
    apiPage++;

    fetch(`https://api.themoviedb.org/3/discover/${API_TYPE}?include_adult=false&language=en-US&page=${apiPage}&sort_by=popularity.desc`, OPTIONS)
        .then(res => res.json())
        .then(data => {
            const newData = data.results || [];
            allContent = [...allContent, ...newData];

            // Re-aplicar filtro y orden si existen
            const atr = document.getElementById("atributo")?.value;
            const val = document.getElementById("valor")?.value;
            const gen = document.getElementById("genero")?.value;
            const ord = document.getElementById("orden")?.value;

            filteredContent = Filtra(allContent, { text: val, genreId: gen });
            filteredContent = AplicaSort(filteredContent, { attribute: atr, order: ord });

            isFetching = false;
            DisplayNextBatch();

            updateLoadMoreVisibility();
        })
        .catch(err => {
            console.error("Error cargando más contenido:", err);
            isFetching = false;
        });
}

/**
 * Filtra según texto y género
 * @param {Array} arItems Array de películas o series
 * @param {Object} objFiltro {text, genreId}
 * @return {Array} Array filtrado
 */
const Filtra = (arItems, objFiltro) => {
    const { text, genreId } = objFiltro;
    let pool = [...arItems];

    if (text) {
        const query = text.toLowerCase();
        pool = pool.filter(movie =>
            (movie[FIELD_TITLE] && movie[FIELD_TITLE].toLowerCase().includes(query)) ||
            (movie.overview && movie.overview.toLowerCase().includes(query))
        );
    }

    if (genreId && genreId !== "") {
        const id = parseInt(genreId);
        pool = pool.filter(m => m.genre_ids && m.genre_ids.includes(id));
    }

    return pool;
}

/**
 * Ordena el array de contenido
 * @param {Array} arItems Array de películas o series
 * @param {Object} objSort {attribute, order}
 * @return {Array} Array ordenado
 */
const AplicaSort = (arItems, objSort) => {
    const { attribute, order } = objSort;
    if (!attribute || attribute === "none") return arItems;

    return [...arItems].sort((a, b) => {
        let valA = a[attribute];
        let valB = b[attribute];

        if (attribute === FIELD_DATE) {
            valA = valA ? new Date(valA) : new Date(0);
            valB = valB ? new Date(valB) : new Date(0);
        } else if (attribute === FIELD_TITLE) {
            valA = valA ? valA.toLowerCase() : '';
            valB = valB ? valB.toLowerCase() : '';
        }

        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Abre el modal con los detalles del item
 * @param {Object} item Objeto con la información del item
 */
const OpenModal = (item) => {
    const modal = document.getElementById("movie-modal");
    const container = document.getElementById("modal-content");

    // Limpiar contenido previo para que no se acumule
    container.textContent = "";

    // 1. Preparación de datos
    const backdropPath = item.backdrop_path ? `${IMG_BASE_URL}${item.backdrop_path}` : 'assets/no-image.jpg';
    const posterPath = item.poster_path ? `${IMG_BASE_URL}${item.poster_path}` : 'assets/no-poster.jpg';
    const genres = (item.genre_ids || []).map(id => genresMap[id] || 'Otro').join(', ');
    const title = item[FIELD_TITLE] || 'Sin título';
    const date = item[FIELD_DATE] || 'N/A';

    // 2. Crear estructura (Contenedor Principal)
    const details = document.createElement('div');
    details.className = 'modal__details';

    // Imagen de fondo (Backdrop)
    const backdropImg = document.createElement('img');
    backdropImg.src = backdropPath;
    backdropImg.alt = title;
    backdropImg.className = 'modal__backdrop';

    // Contenedor de información (Info)
    const infoContainer = document.createElement('div');
    infoContainer.className = 'modal__info';

    // Imagen de Poster
    const posterImg = document.createElement('img');
    posterImg.src = posterPath;
    posterImg.alt = title;
    posterImg.className = 'modal__poster';

    // Cuerpo del modal (Body)
    const modalBody = document.createElement('div');
    modalBody.className = 'modal__body';

    const h2 = document.createElement('h2');
    h2.className = 'modal__title';
    h2.textContent = title;

    // Meta datos (Estrellas y Fecha)
    const metaDiv = document.createElement('div');
    metaDiv.className = 'modal__meta';

    const spanRating = document.createElement('span');
    spanRating.className = 'modal__tag';
    spanRating.textContent = `${item.vote_average.toFixed(1)}`;

    const spanDate = document.createElement('span');
    spanDate.className = 'modal__tag';
    spanDate.textContent = `${date}`;

    metaDiv.append(spanRating, spanDate);

    // Géneros
    const pGenres = document.createElement('p');
    pGenres.className = 'modal__tag';
    pGenres.textContent = genres;

    // Sinopsis (Overview)
    const pOverview = document.createElement('p');
    pOverview.className = 'modal__overview';
    pOverview.textContent = item.overview || 'Sin descripción disponible.';

    // Botón de acción
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'modal__actions';

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn--neon modal__add-btn';
    addBtn.dataset.id = item.id;
    addBtn.textContent = 'AÑADIR AL CARRITO';

    // 3. Ensamblaje
    actionsDiv.append(addBtn);
    modalBody.append(h2, metaDiv, pGenres, pOverview, actionsDiv);
    infoContainer.append(posterImg, modalBody);
    details.append(backdropImg, infoContainer);

    container.append(details);

    // 4. Mostrar modal
    modal.classList.add("modal--open");
    document.body.style.overflow = "hidden";
}

/**
 * Cierra el modal
 */
const CloseModal = () => {
    const modal = document.getElementById("movie-modal");
    if (modal) {
        modal.classList.remove("modal--open");
        document.body.style.overflow = ""; // Restaurar scroll
    }
}

/**
 * Helper para actualizar visibilidad del botón Load More
 */
const updateLoadMoreVisibility = () => {
    const btn = document.getElementById("load-more");
    if (btn) {
        const val = document.getElementById("valor")?.value;
        const gen = document.getElementById("genero")?.value;
        const isFiltering = val !== "" || gen !== "";

        if (displayedCount >= filteredContent.length && (isFiltering || isFetching)) {
            btn.style.display = "none";
        } else {
            btn.style.display = "block";
        }
    }
}

/**
 * Función principal
 */
const main = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        location.href = 'login.html';
        return;
    }

    // Actualizar Inicial de Usuario
    const userInitial = document.getElementById("user-initial");
    if (userInitial && user.username) {
        userInitial.textContent = user.username.charAt(0).toUpperCase();
    }

    // --- GESTIÓN DEL CARRITO --- (Global para todas las páginas)
    let almacenado = JSON.parse(localStorage.getItem("carrito")) || [];
    let carrito = new Carrito(almacenado);

    const cartDrawer = document.getElementById("cart-drawer");
    const cartOverlay = document.getElementById("cart-overlay");
    const cartContainer = document.getElementById("cart-container");
    const cartBadge = document.getElementById("cart-badge");

    const updateUI = () => {
        if (cartContainer) {
            cartContainer.innerHTML = "";
            cartContainer.appendChild(carrito.dibujaCarrito());
        }
        if (cartBadge) {
            cartBadge.textContent = carrito.getTotalItems();
        }
        localStorage.setItem("carrito", JSON.stringify(carrito.articulos));
    };

    updateUI();

    const openCart = () => {
        cartDrawer?.classList.add("cart-drawer--open");
        cartOverlay?.classList.add("cart-overlay--visible");
    };

    const closeCart = () => {
        cartDrawer?.classList.remove("cart-drawer--open");
        cartOverlay?.classList.remove("cart-overlay--visible");
    };

    document.getElementById("cart-toggle")?.addEventListener("click", openCart);
    document.getElementById("cart-close")?.addEventListener("click", closeCart);
    cartOverlay?.addEventListener("click", closeCart);

    // Salir (Cerrar sesión)
    document.getElementById("user-profile-btn")?.addEventListener("click", () => {
        if (confirm("¿Cerrar sesión?")) {
            localStorage.removeItem("user");
            location.href = "login.html";
        }
    });

    // --- LÓGICA ESPECÍFICA DE CATALOGO (Sólo en movies.html o series.html) ---
    const contenedorProductos = document.getElementById("productos");
    if (contenedorProductos) {

        // 1. Cargar Géneros
        fetch(`https://api.themoviedb.org/3/genre/${API_TYPE}/list?language=es`, OPTIONS)
            .then(res => res.json())
            .then(data => {
                const genreSelect = document.getElementById("genero");
                data.genres.forEach(g => {
                    genresMap[g.id] = g.name;
                    if (genreSelect) {
                        const opt = document.createElement("option");
                        opt.value = g.id;
                        opt.textContent = g.name;
                        genreSelect.appendChild(opt);
                    }
                });
            });

        // 2. Cargar Contenido Inicial
        fetch(`https://api.themoviedb.org/3/discover/${API_TYPE}?include_adult=false&language=en-US&page=1&sort_by=popularity.desc`, OPTIONS)
            .then(res => res.json())
            .then(data => {
                allContent = data.results || [];
                filteredContent = [...allContent];

                const atr = document.getElementById("atributo")?.value;
                const ord = document.getElementById("orden")?.value;
                filteredContent = AplicaSort(filteredContent, { attribute: atr, order: ord });

                DisplayNextBatch(true);

                const btnLoadMore = document.getElementById("load-more");
                btnLoadMore?.addEventListener("click", () => {
                    DisplayNextBatch();
                    updateLoadMoreVisibility();
                });

                updateLoadMoreVisibility();

                // Delegación para añadir al carrito
                contenedorProductos.addEventListener('click', (event) => {
                    const addBtn = event.target.closest('.movie-card__action');
                    const card = event.target.closest('.movie-card');

                    if (addBtn) {
                        event.stopPropagation();
                        const cardElement = addBtn.closest('.movie-card');
                        const id = parseInt(cardElement.dataset.id);
                        const selected = allContent.find(m => m.id === id);

                        if (selected) {
                            // Normalizar para el carrito (usar 'title' para mostrarlo)
                            const toAdd = { ...selected, title: selected[FIELD_TITLE] };
                            carrito.add(toAdd);
                            updateUI();
                            openCart();
                        }
                    } else if (card) {
                        const id = parseInt(card.dataset.id);
                        const selected = allContent.find(m => m.id === id);
                        if (selected) OpenModal(selected);
                    }
                });

                // Cierre de modal
                document.getElementById("modal-close")?.addEventListener("click", CloseModal);
                document.getElementById("modal-overlay")?.addEventListener("click", CloseModal);

                // Añadir al carrito desde el modal
                document.getElementById("modal-content")?.addEventListener("click", (e) => {
                    const btn = e.target.closest(".modal__add-btn");
                    if (btn) {
                        const id = parseInt(btn.dataset.id);
                        const selected = allContent.find(m => m.id === id);
                        if (selected) {
                            const toAdd = { ...selected, title: selected[FIELD_TITLE] };
                            carrito.add(toAdd);
                            updateUI();
                            openCart();
                            CloseModal();
                        }
                    }
                });

                // Filtros y Orden
                document.getElementById("filtra")?.addEventListener('click', (event) => {
                    event.preventDefault();
                    const val = document.getElementById("valor").value;
                    const gen = document.getElementById("genero").value;
                    const atr = document.getElementById("atributo").value;
                    const ord = document.getElementById("orden").value;

                    filteredContent = Filtra(allContent, { text: val, genreId: gen });
                    filteredContent = AplicaSort(filteredContent, { attribute: atr, order: ord });

                    DisplayNextBatch(true);
                    updateLoadMoreVisibility();
                });
            })
            .catch(err => console.error("Error cargando contenido:", err));
    }

    // Evento para eliminar del carrito (Global)
    cartContainer?.addEventListener("click", (e) => {
        const removeBtn = e.target.closest(".cart-item__remove");
        if (removeBtn) {
            const id = parseInt(removeBtn.dataset.id);
            carrito.remove(id);
            updateUI();
        }
    });

    // Evento para modificar cantidades en el carrito (Global)
    cartContainer?.addEventListener("click", (e) => {
        const btnPlus = e.target.closest(".cart-item__qty-btn--plus");
        const btnMinus = e.target.closest(".cart-item__qty-btn--minus");

        if (btnPlus) {
            const id = parseInt(btnPlus.dataset.id);
            const item = carrito.articulos.find(i => i.id === id);
            carrito.add(item);   // aumenta cantidad
            updateUI();
        }

        if (btnMinus) {
            const id = parseInt(btnMinus.dataset.id);
            carrito.remove(id);  // baja cantidad o elimina si llega a cero
            updateUI();
        }
    });

    // Finalizar compra
    document.body.addEventListener("click", (e) => {
        const btnCheckout = e.target.closest(".cart-footer__checkout");
        if (!btnCheckout) return;

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.email) {
            alert("No podemos enviar email sin un correo asociado al usuario");
            return;
        }

        // Generar HTML de los items
        const itemsHTML = carrito.articulos
            .map(item =>
                `<tr>
               <td>${item.title}</td>
               <td style="text-align:center;">${item.quantity}</td>
               <td style="text-align:right;">${item.price}€</td>
             </tr>`
            )
            .join("");

        // Preparar parámetros para EmailJS
        const templateParams = {
            to_name: user.username,
            email: user.email,
            items_html: itemsHTML,
            order_total: carrito.getTotalPrice()
        };

        // Enviar email
        emailjs.send("service_k1wtqfl", "template_at5x5tc", templateParams)
            .then(() => {
                // Confirmación
                alert("¡Pedido confirmado! 📩 Recibirás un email en unos segundos.");

                // --- VACIAR CARRITO ---
                carrito.articulos = [];
                localStorage.setItem("carrito", JSON.stringify([]));

                // Actualizar UI
                updateUI();

                // Cerrar carrito
                closeCart();
            })
            .catch((err) => {
                console.error("Error al enviar email:", err);
                alert("Hubo un error enviando el email 😢");
            });
    });
};

document.addEventListener('DOMContentLoaded', main);