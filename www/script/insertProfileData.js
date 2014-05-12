/*
 * JavaScript code related to index.html page.
 * 
 * @author David Miguel de la Fuente.
 * @version 0.3
 */
var username, age, sex, studies;
var URL_dir = "http://192.168.1.100:8080/SocioRutaServer/Guiones/";
var path_root_dir = "SocioRuta";
/*
 * Recopile user profile data from form to encapsulate it into a
 * JSON object to store at local storage.
 */
function getInfo() {
    var user_profile = {};
    user_profile.name = username.value;
    user_profile.age = age.value;
    user_profile.sex = document.getElementById("sex").value;
    user_profile.studies = document.getElementById("studies").value;
    localStorage.user_profile = JSON.stringify(user_profile);
    location.href = "./scriptsList.html";
}
/*
 * Enable or disable the button to recopile profile user from form.
 */
function enableNextButton() {
    var nextButton = document.getElementById("btn_next");
    if (username.value !== "" && age.value !== "") {
        nextButton.disabled = false;
    } else {
        nextButton.disabled = true;
    }
}
/*
 * Initialize.
 */
function init() {
    console.log("Initializing user profile insertion page")
    localStorage.URL_dir = URL_dir;
    localStorage.path_root_dir = path_root_dir;

    username = document.getElementById("username");
    age = document.getElementById("age");
    sex = document.getElementById("sex");
    studies = document.getElementById("studies");
    if (localStorage.user_profile) {
        console.log("Previous user profile encountered");
        var user_profile = JSON.parse(localStorage.user_profile);
        username.value = user_profile.name;
        console.log("Name: " + user_profile.name);
        age.value = user_profile.age;
        console.log("Age: " + user_profile.age);
        sex.options[0].text == user_profile.sex ?
                sex.selectedIndex = 0 :
                sex.selectedIndex = 1;
        console.log("Sex: " + user_profile.sex + " (option " + sex.selectedIndex + ")");
        for (var i = 0; i < studies.length; ++i) {
            if (studies.options[i].text == user_profile.studies) {
                studies.selectedIndex = i;
            }
        }
        console.log("Studies: " + user_profile.studies + " (option " + studies.selectedIndex + ")");
    }
    username.addEventListener('change', enableNextButton);
    age.addEventListener('change', enableNextButton);
    var next_button = document.getElementById("btn_next");
    next_button.addEventListener('click', getInfo);

    enableNextButton();
}
document.addEventListener('deviceready', init);