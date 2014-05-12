/*
 * JavaScript code related to scriptViewer.html window
 * 
 * @author David Miguel de la Fuente.
 * @version 0.2
 */
var nodes, initial_node, graph, script_info;
var root_dir;
var downloadErrOcurred = false;
/*
 * Execute the routines to initialize the page.
 */
function init() {
    script_info = JSON.parse(sessionStorage.script_info);
    document.title = "Guion: " + script_info.name;
    try {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
            fs.root.getDirectory(localStorage.path_root_dir, {create: false}, function(dir) {
                root_dir = dir;
                getScript();
            }, fileError);
        }, fileError);
    } catch (err) {
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
            var fieldset = document.getElementsByTagName("fieldset")[0];
            fieldset.style.height = "100%";
            advices_strategies_box.style.display = "block";
            questions_box.style.display = "none";
            answers_box.style.display = "none";
            document.getElementById("answers_section").style.display = "none";
            removeAllChilds(advices_strategies_box);
            advices_strategies_box.appendChild(element);
            var button = document.createElement("input");
            button.type = "submit";
            if (node.type === "tip") {
                node_type.innerHTML = "Consejo";
                button.value = "Seguir";
                button.onclick = function() {
                    showNode(node.destinations[0]);
                };
            }
            else {
                node_type.innerHTML = "Estrategia";
                button.value = "Aceptar";
                button.onclick = function() {
                    history.back(1);
                };
            }
            advices_strategies_box.appendChild(button);
        }
    }
    if (node.type === "answer") {
        element.className = "answer";
        createMultimediaBar(element, node);
        var text_box = document.createElement("p");
        text_box.innerText = node.text;
        text_box.className = "answer_text_box";
        text_box.addEventListener('click', function() {
            showNode(node.destinations[0]);
        });
        element.appendChild(text_box);
        answers_box.appendChild(element);
    }
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
        icon_elem.onclick = function() {
            var viewer = document.getElementById("multimedia_viewer");
            var elem_mm = document.createElement(type);
            elem_mm.id = "multimedia_content";
            if (type === "video" || type === "audio") {
                elem_mm.autoplay = "true";
                elem_mm.controls = "true";
            }
            root_dir.getFile(script_info.name + "/" + multimedia, {create: false},
            function(file_entry) {
                console.log("File \"" + multimedia + "\" encountered in local filesystem at " + file_entry.toNativeURL());
                elem_mm.src = file_entry.toNativeURL();
            }, fileError);
            if (elem_mm.src === "") {
                elem_mm.src = script_info.dir_route + "/" + multimedia;
            }
            var content = document.getElementById("multimedia_content");
            if (content)
                viewer.replaceChild(elem_mm, viewer.firstChild);
            else
                viewer.insertBefore(elem_mm, viewer.childNodes[0]);
            viewer.parentNode.style.display = "block";
        };
    }
    else {
        icon_elem.className = "no_linked_icon";
        icon_elem.title = icon_elem.title + "- No disponible";
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
        file_entry.getMetadata(function(metadata) {
            console.log("Metadata of " + multimedia + " obtained");
            var local_date = metadata.modificationTime;
            var petition = new XMLHttpRequest();
            petition.open("HEAD", script_info.dir_route + "/" + multimedia);
            petition.addEventListener('load', function(headers) {
                console.log("Headers of " + multimedia + " obtained");
                var remote_date = Date.parse(this.getResponseHeader("Last-Modified"));
                console.log("Local file \"" + multimedia + "\" with date" + local_date.toString());
                console.log("Remote file " + multimedia + " with date " + remote_date.toString());
                if (local_date < remote_date) {
                    console.log("Newer remote version of " + multimedia + ", downloading")
                    alert("down " + multimeda);
                    downloadMedia(multimedia);
                } else {
                    console.log("Local version of " + multimedia + " already up to date");
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
    var petition = new XMLHttpRequest();
    petition.open('GET', script_info.dir_route + "/" + multimedia);
    petition.responseType = 'arraybuffer';
    failure_alert = function() {
        console.log("Error al obtener fichero " + multimedia + " desde servidor");
        if (downloadErrOcurred == false) {
            downloadErrOcurred = true;
            alert("Se ha producido un error de descarga con uno o varios ficheros multimedia");
        }
    };
    petition.addEventListener('load', function(e) {
        if (this.status === 200) {
            console.log("GET OK");
            root_dir.getFile(script_info.name + "/" + multimedia, {create: true}, function(file_entry) {
                file_entry.createWriter(function(fw) {
                    var data = e.target.response;
                    console.log("Starting to write " + multimedia);
                    writeContent(fw, data);
                }, fileError);
            }, fileError);
        }
        else {
            failure_alert;
        }
    });
    petition.addEventListener('error', failure_alert());
    console.log("GET remote file \"" + script_info.dir_route + "/" + multimedia + "\"");
    petition.send();
}
/**
 * Write the multimedia content got from a remote server in the persistent local
 * storage.
 * 
 * @param fw
 *              FileWriter related to the file that is going to be written.
 * @param data
 *              data to be written into file.
 */
function writeContent(fw, data) {
    var written = 0;
    var BLOCK_SIZE = 1024 * 1024;
    function writeNextBlock() {
        var block_end = Math.min(BLOCK_SIZE, data.byteLength - written);
        var data_block = data.slice(written, written + block_end);
        fw.write(data_block);
        written += block_end;
    }
    fw.onwrite = function() {
        if (written < data.byteLength)
            writeNextBlock();
        else
            console.log("File writing OK ");
    };
    fw.onwritestart = function() {
        if (written === 0)
            console.log("Starting file writing");
        else
            console.log("Writing file from " + written + " to " + written + BLOCK_SIZE);
    };
    fw.onerror = function() {
        console.log("File writing ERROR");
    };
    writeNextBlock();
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
window.addEventListener('load', init);