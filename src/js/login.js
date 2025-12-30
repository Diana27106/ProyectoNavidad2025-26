/**
 * Datos de los captchas
 */
const captchas = [
    { img: "./assets/captchas/captcha1.png", text: "263S2V" },
    { img: "./assets/captchas/captcha2.png", text: "RUNAJIX" },
    { img: "./assets/captchas/captcha3.png", text: "mwxe2" },
    { img: "./assets/captchas/captcha4.png", text: "AAXUE" }
];

let captchaActual = null;

/**
 * Carga un captcha aleatorio
 */
const loadCaptcha = () => {
    const randomIndex = Math.floor(Math.random() * captchas.length);
    captchaActual = captchas[randomIndex];
    const captchaImg = document.getElementById("captchaImg");
    const captchaInput = document.getElementById("captchaInput");

    if (captchaImg) captchaImg.src = captchaActual.img;
    if (captchaInput) captchaInput.value = "";
}

/**
 * Valida si el objeto existe en la API fakestoreapi/users
 * @param {Object} obUser Objeto usuario con { user, pass}
 */
const valida = (obUser) => {
    fetch("/api/users")
        .then(res => res.json())
        .then(data => {
            // Comprobamos que el usuario exista
            let user = data.find(usuario => usuario.username == obUser.user && usuario.password == obUser.pass)
            if (user) {
                let usuario = {
                    id: user.id,
                    email: user.email,
                    username: user.username
                }
                // Si existe lo guardamos en el localStorage y redirigimos a index.html
                localStorage.setItem("user", JSON.stringify(usuario));
                location.href = "index.html"
                return usuario
            } else {
                alert("Usuario o contraseña incorrectos")
                loadCaptcha();
                return null;
            }
        })
        .catch(err => {
            console.error("Error al validar usuario:", err);
            alert("Error de conexión con el servidor");
        });
}

/**
 * Registra un nuevo usuario en la base de datos
 * @param {Object} userData Datos del usuario a registrar
 */
const registerUser = (userData) => {
    // Primero verificamos que el usuario no exista
    fetch("/api/users")
        .then(res => res.json())
        .then(data => {
            const existingUser = data.find(u => u.username === userData.username || u.email === userData.email);

            if (existingUser) {
                alert("El usuario o correo electrónico ya existe");
                loadCaptcha();
                return;
            }

            // Si no existe, procedemos al registro
            return fetch("/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });
        })
        .then(res => {
            if (res && res.ok) {
                alert("¡Cuenta creada con éxito! Por favor inicia sesión.");
                window.location.href = "login.html";
            }
        })
        .catch(err => {
            console.error("Error en registro:", err);
            alert("Error al intentar registrar el usuario");
        });
}

/**
 * Función principal donde añado los eventos y pruebo que todo funcione
 */
const main = () => {
    // Cargar primer captcha
    loadCaptcha();

    // Evento para refrescar captcha
    const refreshBtn = document.getElementById("refreshCaptcha");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", loadCaptcha);
    }

    // Lógica para Login
    const loginBtn = document.getElementById("login");
    if (loginBtn) {
        loginBtn.addEventListener("click", (event) => {
            event.preventDefault();

            let usu = document.getElementById("user").value;
            let cont = document.getElementById("pass").value;
            let captchaIntro = document.getElementById("captchaInput").value;

            // Validación de captcha
            if (captchaIntro !== captchaActual.text) {
                alert("Captcha incorrecto. Inténtalo de nuevo.");
                loadCaptcha();
                return;
            }

            valida({ user: usu, pass: cont });
        });
    }

    // Lógica para Registro
    const registerBtn = document.getElementById("registrar");
    if (registerBtn) {
        registerBtn.addEventListener("click", (event) => {
            event.preventDefault();

            const user = document.getElementById("user").value;
            const email = document.getElementById("email").value;
            const pass = document.getElementById("pass").value;
            const confirmPass = document.getElementById("confirmPass").value;
            const captchaIntro = document.getElementById("captchaInput").value;

            // Validaciones básicas
            if (!user || !email || !pass || !confirmPass) {
                alert("Por favor completa todos los campos");
                return;
            }

            if (captchaIntro !== captchaActual.text) {
                alert("Captcha incorrecto. Inténtalo de nuevo.");
                loadCaptcha();
                return;
            }

            if (pass !== confirmPass) {
                alert("Las contraseñas no coinciden");
                return;
            }

            // Objeto usuario a guardar
            const newUser = {
                username: user,
                email: email,
                password: pass,
                name: user // Usamos el username como nombre por defecto si no hay campo nombre
            };

            registerUser(newUser);
        });
    }
}

document.addEventListener('DOMContentLoaded', main)