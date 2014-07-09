/*
 * JavaScript code related to scriptViewer.html window
 * 
 * @author David Miguel de la Fuente.
 * @version 0.2
 */
var nodes, initial_node, graph, script_info;
var root_dir;
var downloadErrOcurred = false;
var pendingDownloads = 0, downloadsDone = 0;
/*
 * Execute the routines to initialize the page.
 */
function init() {
    console.log("--------- Initializing ScriptViewer Page----------");
    script_info = JSON.parse(sessionStorage.script_info);
    document.title = script_info.name;
    if (document.getElementById("rotule"))
        document.getElementById("rotule").innerHTML = script_info.name;
    try {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
            fs.root.getDirectory(localStorage.path_root_dir, {create: false}, function(dir) {
                root_dir = dir;
                getScript();
            }, fileError);
        }, fileError);
    } catch (err) {
        console.log("Error getting FS");
        alert(err);
    }
}
/*
 * Recover from persistent local storage the script as plain text and become
 * it in memory as a XML document for its interpretation.
 */
function getScript() {
    console.log("Loading script \"" + script_info.name + ".graph\"");
    root_dir.getFile(script_info.name + "/" + script_info.name + ".graph", {create: false}, function(file_entry) {
        console.log("Script loading OK");
        file_entry.file(function(file) {
            var fr = new FileReader();
            fr.onload = function(evt) {
                console.log("Script reading OK");
                var parser = new DOMParser();
                graph = parser.parseFromString(evt.target.result, "application/xml");
                formGraph();
            };
            console.log("Reading script");
            fr.readAsText(file);
        }, fileError);
    }, function() {
        console.log("ERROR loading script");
        alert("Imposible cargar el guión");
    });
}
/*
 * Link the node objects to connect them as in the graph.
 */
function createNodeRelations() {
    var links = graph.getElementsByTagName("edge");
    for (var i = 0; i < links.length; ++i) {
        var actual_link = links[i];
        var origin = actual_link.getElementsByTagName("source")[0].textContent.trim();
        var destino = actual_link.getElementsByTagName("target")[0].textContent.trim();
        nodes[origin].destinations.push(nodes[destino]);
    }
    showNode(initial_node);
}
/*
 * Create in memory the graph with the script's nodes.
 */
function formGraph() {
    var XMLnodes_elems = graph.getElementsByTagName("cell");
    nodes = [];
    for (var i = 0; i < XMLnodes_elems.length; ++i) {
        var actual_elem = XMLnodes_elems[i];
        var node = {};
        node.type = actual_elem.getElementsByTagName("type")[0].textContent.trim();
        node.id = actual_elem.getElementsByTagName("id")[0].textContent.trim();
        node.text = actual_elem.getElementsByTagName("text")[0].textContent.trim();
        node.video = actual_elem.getElementsByTagName("video")[0].textContent.trim();
        node.video = replaceAll(node.video, "\\", "/");
        if (node.video != "")
            compareDates(node.video);
        node.image = actual_elem.getElementsByTagName("image")[0].textContent.trim();
        node.image = replaceAll(node.image, "\\", "/");
        if (node.image != "")
            compareDates(node.image);
        node.audio = actual_elem.getElementsByTagName("audio")[0].textContent.trim();
        node.audio = replaceAll(node.audio, "\\", "/");
        if (node.audio != "")
            compareDates(node.audio);
        if (node.type === "question") {
            if (actual_elem.getElementsByTagName("start")[0].textContent.trim() === "true") {
                initial_node = node;
            }
        }
        node.destinations = [];
        nodes[node.id] = node;
    }
    createNodeRelations();
}
/*
 * Generate the representation of a given node.
 * 
 * @param node
 *              the given node to represent.
 */
function showNode(node) {
    var element = document.createElement("div");
    var answers_box = document.getElementById("answers_box");
    if (node.type === "question" ||
            node.type === "strategy" ||
            node.type === "tip") {
        var questions_box = document.getElementById("questions_box");
        removeAllChilds(questions_box);
        removeAllChilds(answers_box);
        var elem_text = document.createElement("p");
        elem_text.innerHTML = node.text;
        elem_text.innerText = node.text;
        element.appendChild(elem_text);
        createMultimediaBar(element, node);
        if (node.type === "question") {
            questions_box.appendChild(element);
            for (var i = 0; i < node.destinations.length; ++i) {
                showNode(node.destinations[i]);
            }
        }
        else {
            var advices_strategies_box = document.getElementById("advices_strategies_box");
            var node_type = document.getElementById("node_type");
            advices_strategies_box.style.display = "block";
            questions_box.style.display = "none";
            answers_box.style.display = "none";
            document.getElementById("answers_section").style.display = "none";
            removeAllChilds(advices_strategies_box);
            advices_strategies_box.appendChild(element);
            var button = document.createElement("input");
            button.type = "button";
            if (node.type === "tip") {
                node_type.innerHTML = "Consejo";
                button.value = "Seguir";
                button.addEventListener('click', function() {
                    navigator.notification.vibrate(100);
                    showNode(node.destinations[0]);
                });
            }
            else {
                node_type.innerHTML = "Estrategia";
                button.value = "Aceptar";
                button.addEventListener('click', function() {
                    navigator.notification.vibrate(100);
                    history.back(1);
                });
            }
            advices_strategies_box.appendChild(button);
        }
    }
    if (node.type === "answer") {
        element.className = "answer";
        createMultimediaBar(element, node);
        var text_box = document.createElement("p");
        text_box.innerText = node.text;
        text_box.innerHTML = node.text;
        text_box.className = "answer_text_box";
//        text_box.style.width = window.innerWidth - (7*16) + "px";
        text_box.addEventListener('click', function() {
            navigator.notification.vibrate(100);
            showNode(node.destinations[0]);
        });
        element.appendChild(text_box);
        answers_box.appendChild(element);
    }
    resize();
}
/*
 * Create a bar with icons to access the multimedia content from the script.
 * 
 * @param element
 *              element DOM element to add icons to.
 * @param node
 *              node object with the multimedia content associated.
 */
function createMultimediaBar(element, node) {
    var mmbar_elem = document.createElement("p");
    mmbar_elem.className = "multimedia_bar";
    createMultimediaElement(mmbar_elem, node.image, "img");
    createMultimediaElement(mmbar_elem, node.audio, "audio");
    createMultimediaElement(mmbar_elem, node.video, "video");
    element.appendChild(mmbar_elem);
}
/*
 * Create each element of the multimedia bar.
 * 
 * @param bar
 *              DOM element of the icon bar.
 * @param multimedia
 *              info of the multimedia content.
 * @param type
 *              type of the multimedia content.
 */
function createMultimediaElement(bar, multimedia, type) {
    var icon_elem = document.createElement("img");
    if (type === "img") {
        icon_elem.src = "./images/image_icon.png";
        icon_elem.title = "Ver imagen";
    }
    if (type === "audio") {
        icon_elem.src = "./images/audio_icon.png";
        icon_elem.title = "Escuchar audio";
    }
    if (type === "video") {
        icon_elem.src = "./images/video_icon.png";
        icon_elem.title = "Ver video";
    }
    if (multimedia !== "") {
        icon_elem.className = "linked_icon";
        icon_elem.addEventListener('click', function() {
            navigator.notification.vibrate(100);
            var viewer = document.getElementById("multimedia_viewer");
            var elem_mm = document.createElement(type);
            elem_mm.id = "multimedia_content";
            root_dir.getFile(script_info.name + "/" + multimedia, {create: false},
            function(file_entry) {
                console.log("File \"" + multimedia + "\" encountered in local filesystem at " + file_entry.toURL());
                elem_mm.src = file_entry.toURL();
                viewer.insertBefore(elem_mm, viewer.childNodes[0]);
                viewer.parentNode.style.display = "block";
                if (type === "video" || type === "audio") {
                    elem_mm.controls = "true";
                    elem_mm.play();
                }
            }, fileError);
        });
    }
    else {
        icon_elem.className = "no_linked_icon";
        icon_elem.title = icon_elem.title + " - No disponible";
    }
    bar.appendChild(icon_elem);
}
/**
 * Get the last modification date of local and remote version of content
 * and download if neccessary to store in local persisten filesystem.
 * @param multimedia
 *              route of multimedia file
 */
function compareDates(multimedia) {
    root_dir.getFile(script_info.name + "/" + multimedia, {create: false}, function(file_entry) {
        file_entry.file(function(file) {
            console.log("Metadata of " + multimedia + " obtained");
            var local_date = new Date(file.lastModifiedDate);
            var petition = new XMLHttpRequest();
            petition.open("HEAD", script_info.dir_route + "/" + multimedia);
            petition.addEventListener('load', function() {
                if (this.status == 200) {
                    console.log("Headers of " + multimedia + " obtained");
                    var remote_date = new Date(this.getResponseHeader("Last-Modified"));
                    console.log("Local file \"" + multimedia + "\" with date" + local_date);
                    console.log("Remote file " + multimedia + " with date " + remote_date);
                    if (local_date < remote_date) {
                        console.log("Newer remote version of " + multimedia + ", downloading");
                        downloadMedia(multimedia);
                    } else {
                        console.log("Local version of " + multimedia + " already up to date");
                    }
                }
                else {
                    console.log("Error with file " + multimedia + ", doesn't exist at server");
                    if (downloadErrOcurred == false) {
                        downloadErrOcurred = true;
                        navigator.notification.alert("No ha sido posible encontrar" +
                                "todo el contenido multimedia en servidor", {}, "Error de contenido multimedia");
                    }
                }
            });
            petition.send();
        });
    }, function() {
        console.log("File " + multimedia + " doesn't exist on local filesystem yet.");
        downloadMedia(multimedia);
    });
}
/*
 * Get the online multimedia content and download it to the
 * persistent local storage.
 * 
 * @param multimedia
 *              route of the multimedia content to be downloaded.
 */
function downloadMedia(multimedia) {
    var file_name = multimedia.substr(multimedia.lastIndexOf('/') + 1);
    var mm_type_dir = script_info.name + "/" + multimedia.substr(0, multimedia.lastIndexOf('/') + 1);
    console.log(mm_type_dir);
    root_dir.getDirectory(mm_type_dir, {create: false}, function(dir_entry) {
        var ft = new FileTransfer();
        var filePath = dir_entry.toURL();
        console.log("Trying to download file " + multimedia + " to " + filePath);
        pendingDownloads += 1;
        showDownloadingContentAlert();
        ft.download(encodeURI(script_info.dir_route + "/" + multimedia),
                filePath + "/" + file_name,
                function() {
                    console.log("Multimedia file " + multimedia + " succesfully downloaded");
                    downloadsDone += 1;
                    refreshDownloadingContentAlert();
                },
                function() {
                    console.log("Error obtaining " + multimedia + " from server");
                    if (downloadErrOcurred == false) {
                        downloadErrOcurred = true;
                        navigator.notification.alert("No se ha podido completar la descarga " +
                                "de todo el contenido multimedia.", {}, "Error de contenido multimedia");
                    }
                    pendingDownloads -= 1;
                    refreshDownloadingContentAlert();
                },
                false,
                {});
    }, fileError);
}
/*
 * Shows the alert with the information about the download of the
 * script's content
 */
function showDownloadingContentAlert() {
    var screen = document.getElementById("downloading_content_splashscreen");
    screen.style.display = "block";
    refreshDownloadingContentAlert();
}
/*
 * Hides the alert when the download have been finished
 */
function hideDownloadingContentAlert() {
    var screen = document.getElementById("downloading_content_splashscreen");
    screen.style.display = "none";
}
/*
 * Refresh the information about the status of the download of the script's
 * multimedia content.
 */
function refreshDownloadingContentAlert() {
    var current_state_text = document.getElementById("current_state_text");
    var current_state_bar = document.getElementById("percentage_done");
    var percentage_text = document.getElementById("percentage_text");
    current_state_text.innerHTML = "Descargas realizadas: " + downloadsDone + "/" + pendingDownloads;
    var pending_percentage = downloadsDone / pendingDownloads * 100;
    if (pending_percentage > 0) {
        current_state_bar.style.display = "block";
        current_state_bar.style.width = pending_percentage + "%";
    }
    percentage_text.innerHTML = Math.floor(pending_percentage) + "%";
    if (pending_percentage == 100 || isNaN(pending_percentage)) {
        setTimeout(hideDownloadingContentAlert, 1000);
    }
}
/*
 * Hide the multimedia viewer to recover the script navigator view.
 */
function hideMultimediaViewer() {
    var viewer_box = document.getElementById("multimedia_viewer_box");
    var viewer = document.getElementById("multimedia_viewer");
    viewer.removeChild(viewer.firstChild);
    viewer_box.style.display = "none";
}

function resize() {
    console.log("Resizing...");
    var calc_section_height = window.innerHeight - (2.5 * 16);
    if (document.getElementById("answers_section").style.display == 'none') {
        document.getElementsByTagName("fieldset")[0].style.height = (calc_section_height - (2 * 16)) + "px";
    } else {
        calc_section_height /= 2;
        document.getElementById("answers_section").style.height = calc_section_height + "px";
        document.getElementsByTagName("fieldset")[0].style.height = calc_section_height + "px";
    }

    var answers_box = document.getElementsByClassName("answer_text_box");
    var calc_answer_box_width = window.innerWidth - (7 * 16);
    for (var i = 0; i < answers_box.length; ++i) {
        answers_box[i].style.width = calc_answer_box_width + "px";
    }
    console.log("Resizing finished");
}


window.addEventListener('load', function() {
    document.addEventListener('deviceready', function() {
        window.addEventListener('orientationchange', function() {
            setTimeout(resize, 500);
        });
        init();
    });
});