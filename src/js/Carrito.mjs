/**
 * Clase Carrito 
 */
export class Carrito {
    /**
     * @param {Array} arArticulos Array de items: [{id, title, price, quantity, poster_path}]
     */
    constructor(arArticulos = []) {
        this.articulos = arArticulos;
        this.fixedPrice = 3.99;
    }

    /**
     * Añade un producto al carrito incrementando unidades si ya existe
     * @param {Object} movie Objeto con la información del producto
     */
    add(movie) {
        const itemExistente = this.articulos.find(item => item.id === movie.id);

        if (itemExistente) {
            itemExistente.quantity++;
        } else {
            this.articulos.push({
                id: movie.id,
                title: movie.title,
                price: this.fixedPrice,
                quantity: 1,
                poster_path: movie.poster_path
            });
        }
    }

    /**
     * Elimina una unidad o el producto completo
     * @param {String} id ID del producto        
    */
    remove(id) {
        const index = this.articulos.findIndex(item => item.id === id);

        if (index !== -1) {
            if (this.articulos[index].quantity > 1) {
                this.articulos[index].quantity--;
            } else {
                this.articulos.splice(index, 1);
            }
        }
    }

    /** 
     * Obtiene el precio total del carrito
     * @returns {Number} Precio total
     */
    getTotalPrice() {
        return this.articulos
            .reduce((total, item) => total + item.price * item.quantity, 0)
            .toFixed(2);
    }

    /**
     * Obtiene el número total de items en el carrito
     * @returns {Number} Número total de items
     */
    getTotalItems() {
        return this.articulos.reduce((total, item) => total + item.quantity, 0);
    }

    /**
     * Genera el DOM del carrito siguiendo BEM
     * @returns {HTMLElement} Elemento del carrito
     */
    dibujaCarrito() {
        const container = document.createElement("div");
        container.className = "cart-drawer__content";

        // --- CARRITO VACÍO ---
        if (this.articulos.length === 0) {
            const emptyDiv = document.createElement("div");
            emptyDiv.className = "cart-drawer__empty";

            const emptyText = document.createElement("p");
            emptyText.textContent = "Tu carrito está vacío";

            const emptyIcon = document.createElement("span");
            emptyIcon.className = "cart-drawer__empty-icon";
            emptyIcon.textContent = "🛒";

            emptyDiv.append(emptyText, emptyIcon);
            container.appendChild(emptyDiv);
            return container;
        }

        // --- LISTA DE PRODUCTOS ---
        const list = document.createElement("div");
        list.className = "cart-list";

        this.articulos.forEach(item => {
            const itemElement = document.createElement("div");
            itemElement.className = "cart-item";

            const img = document.createElement("img");
            img.className = "cart-item__img";
            img.src = item.poster_path
                ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                : '/assets/no-image.jpg';
            img.alt = item.title;

            const info = document.createElement("div");
            info.className = "cart-item__info";

            const h4 = document.createElement("h4");
            h4.className = "cart-item__title";
            h4.textContent = item.title;

            const details = document.createElement("div");
            details.className = "cart-item__details";

            const spanPrice = document.createElement("span");
            spanPrice.className = "cart-item__price";
            spanPrice.textContent = `${item.price}€`;

            // ---------------- NUEVA SECCIÓN DE CANTIDAD ----------------
            const quantityControls = document.createElement("div");
            quantityControls.className = "cart-item__quantity-controls";

            const btnMinus = document.createElement("button");
            btnMinus.className = "cart-item__qty-btn cart-item__qty-btn--minus";
            btnMinus.dataset.id = item.id;
            btnMinus.textContent = "−";

            const spanQty = document.createElement("span");
            spanQty.className = "cart-item__quantity";
            spanQty.textContent = `${item.quantity}`;

            const btnPlus = document.createElement("button");
            btnPlus.className = "cart-item__qty-btn cart-item__qty-btn--plus";
            btnPlus.dataset.id = item.id;
            btnPlus.textContent = "+";

            quantityControls.append(btnMinus, spanQty, btnPlus);
            // -----------------------------------------------------------

            details.append(spanPrice, quantityControls);
            info.append(h4, details);

            const removeBtn = document.createElement("button");
            removeBtn.className = "cart-item__remove";
            removeBtn.dataset.id = item.id;
            removeBtn.textContent = "×";

            itemElement.append(img, info, removeBtn);
            list.appendChild(itemElement);
        });

        const footer = document.createElement("div");
        footer.className = "cart-footer";

        const summary = document.createElement("div");
        summary.className = "cart-footer__summary";

        const label = document.createElement("span");
        label.className = "cart-footer__label";
        label.textContent = `Total (${this.getTotalItems()} items):`;

        const totalAmount = document.createElement("span");
        totalAmount.className = "cart-footer__total";
        totalAmount.textContent = `${this.getTotalPrice()}€`;

        summary.append(label, totalAmount);

        const checkoutBtn = document.createElement("button");
        checkoutBtn.className = "btn btn--neon cart-footer__checkout";
        checkoutBtn.textContent = "PROCEDER AL PAGO";

        footer.append(summary, checkoutBtn);

        container.append(list, footer);

        return container;
    }
}
