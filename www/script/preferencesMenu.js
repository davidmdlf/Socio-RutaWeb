function toggleMenu() {
    navigator.notification.vibrate(100);
    var menu_options = document.getElementById("options");
    var menu_img = document.getElementById("menu_deployer_icon");
    var translucid_backgroundd = document.getElementById("translucid_background");
    if (menu_options.style.display == "inline-block") {
        menu_options.style.display = "none";
        menu_img.src = "images/menu_deployer.png";
        translucid_backgroundd.style.display = "none";
    }
    else {
        menu_options.style.display = "inline-block";
        menu_img.src = "images/menu_undeployer.png";
        translucid_backgroundd.style.display = "block";
    }
}

function addMenuBar() {
    var petition = new XMLHttpRequest();
    petition.open('GET', "preferencesMenu.html#menubar");
    petition.onload = function(e) {
        var element = document.createElement("section");
        element.id = "menu";
        var menu_bar = e.target.responseText.split("<body>")[1];
        menu_bar = menu_bar.split("</body>")[0];
        element.innerHTML = menu_bar;

        var body = document.getElementsByTagName("body")[0];
        body.insertBefore(element, body.firstElementChild);

        document.getElementById("rotule").innerHTML = document.title;
        document.getElementById("menu_deployer_icon").addEventListener('click', toggleMenu);
        document.getElementById("translucid_background").addEventListener('click', toggleMenu);

        document.getElementById("refresh_page").addEventListener('click', refreshPage);
        document.getElementById("refresh_page").addEventListener('click', refreshPage);
        document.getElementById("edit_user_profile").addEventListener('click', editUserProfile);
        document.getElementById("edit_remote_server_URL").addEventListener('click', editRemoteServerURL);
        document.getElementById("about_socio_ruta").addEventListener('click', aboutSocioRutaWeb);
    };
    petition.send();
}

function editUserProfile() {
    navigator.notification.vibrate(100);
    location.href = "index.html";
}

function refreshPage() {
    navigator.notification.vibrate(100);
    document.location.reload(true);
}

function editRemoteServerURL() {
    navigator.notification.vibrate(100);
    toggleMenu();
    function saveChanges(prompt) {
        navigator.notification.vibrate(100);
        if (prompt.buttonIndex == 2) {
            localStorage.URL_dir = "http://" + prompt.input1.trim() + "/SocioRutaServer/Guiones/";
            refreshPage();
        }
    }
    var default_text = "Sin configurar";
    if (localStorage.URL_dir) {
        default_text = localStorage.URL_dir;
        default_text = default_text.split("http://")[1];
        default_text = default_text.split("/SocioRutaServer")[0];
    }
    navigator.notification.prompt("Introduce la dirección del servidor de guiones remotos\n\nActual: " + default_text,
            saveChanges,
            "Editar URL de servidor remoto",
            ["Cancelar", "Aceptar"],
            "p.ej: 192.168.1.100:8008");
}

function aboutSocioRutaWeb() {
    navigator.notification.vibrate(100);
    toggleMenu();
    var title = "Socio-Ruta Web";
    var text = "Socio Ruta Web v0.8\n" +
            "Aplicación para la visualización de guiones sociales para personas con TEA online y localmente.\n\n" +
            "Autor: David Miguel de la Fuente\nContacto: david.mdlf@gmail.com";
    navigator.notification.alert(text, function() {
        navigator.notification.vibrate(100);
    }, title, "Aceptar");
}

window.addEventListener('load', function(){
    addMenuBar();
});