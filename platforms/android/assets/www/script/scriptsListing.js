/*
 * JavaScript code related to scriptsList.html page.
 * 
 * @author David Miguel de la Fuente.
 * @version 1.0
 */

var user_profile;
var root_dir;
var local_graphs = [], remote_graphs;
/*
 * Explore the device storage root for the app files to find '.graphs' files.
 */
function getLocalGraphList() {
    var root_dir_reader = root_dir.createReader(),
            graphs_founded = 0,
            graphs_readed = 0;
    console.log("Starting to explore filesystem for local graphs");
    root_dir_reader.readEntries(readRootDirectory, fileError);

    /*
     * Explore a script dirctory from device storage.
     * @param entries
     *              pointer to each file and directory read in its parent directory.
     */
    function readGraphDirectory(entries) {
        for (var i = 0; i < entries.length; ++i) {
            var entry = entries[i];
            if (entry.isFile) {
                console.log("Local graph founded: \"" + entry.name + "\"");
                graphs_founded += 1;
                entry.file(extractGraphProfile, fileError);
            }
        }
    }

    /*
     * Explore the app root directory in device storage to read them.
     * 
     * @param entries
     *              pointer to each directory in the app root directory.
     */
    function readRootDirectory(entries) {
        if (entries.length == 0) {
            console.log("No entries founded: Root dir is empty");
            getRemoteGraphList();
        }
        for (var i = 0; i < entries.length; ++i) {
            var entry = entries[i];
            if (entry.isDirectory) {
                var dr = entry.createReader();
                console.log("Exploring directory " + entry.name);
                dr.readEntries(readGraphDirectory, fileError);
            }
        }
    }

    /*
     * Extract the graph profile info to be filtered with the user profile
     * and get the synopsis of the graph to show.
     * 
     * @param file
     *              '.graph' file to extract the graph profile info.
     */
    function extractGraphProfile(file) {
        var parser = new DOMParser();
        var fr = new FileReader();
        fr.onloadstart = function() {
            console.log("Starting to read");
        };
        fr.onload = function() {
            var file_text = parser.parseFromString(this.result, "application/xml");
            var XMLprofile = file_text.getElementsByTagName('profile');
            local_graphs.push(XMLprofile[0]);
            graphs_readed += 1;
            console.log("Readed " + graphs_readed + " of " + local_graphs.length);
            if (graphs_readed == graphs_founded) {
                finishLocalSearch();
            }
        };
        fr.onerror = function() {
            console.log("Reading error from graph " + file.name);
        };
        fr.readAsText(file);
    }

    /*
     * Stopped the searching, starting to generate the representation of the
     * graphs' buttons and the remote search of graphs.
     */
    function finishLocalSearch() {
        console.log("Graphs founded " + local_graphs.length);
        local_graphs = Array.prototype.slice.call(local_graphs);
        local_graphs.sort(orderByScriptName);
        listElements(local_graphs);
        getRemoteGraphList();
    }
}

/*
 * Get the XML file in remote server, whose URL is given as a global variable,
 * that content the info of the available scripts.
 */
function getRemoteGraphList() {
    var loading_info_box = document.getElementById("info_box");
    loading_info_box.innerHTML = "Solicitando guiones en línea";
    console.log("Trying to get remote graphs list " + localStorage.URL_dir + "list.xml");
    var list;
    var petition = new XMLHttpRequest();
    petition.open("GET", localStorage.URL_dir + "list.xml");
    function hideScriptsLoadingInfoBox() {
        document.getElementById("loading_scripts_splashscreen").style.display = "none";
    }
    petition.timeout = 5000;
    petition.addEventListener('timeout', function() {
        petition.abort();
        hideScriptsLoadingInfoBox();
    });
    petition.addEventListener('error', function() {
        console.log("Error on getting remote graphs list");
        hideScriptsLoadingInfoBox();
    });
    petition.addEventListener('load', function(e) {
        if (this.status == 200) {
            console.log("Remote graphs list succesfully got");
            list = e.target.responseXML;
            list = list.getElementsByTagName('profile');
            remote_graphs = Array.prototype.slice.call(list);
            removeDuplicates();
        }
        hideScriptsLoadingInfoBox();
    }, false);
    petition.send();
}

/*
 * Remove the duplicated social scripts founded locally and remotely.
 */
function removeDuplicates() {
    var not_duplicated = [];
    for (var i = 0; i < remote_graphs.length; ++i) {
        var founded = false;
        var current_graph = remote_graphs[i];
        var rem_graph_name = current_graph.getElementsByTagName("name")[0].textContent.trim();
        for (var j = 0; j < local_graphs.length && !founded; ++j) {
            var loc_graph_name = local_graphs[j].getElementsByTagName("name")[0].textContent.trim();
            if (rem_graph_name == loc_graph_name) {
                console.log("Duplicated encountered: " + rem_graph_name);
                founded = true;
            }
        }
        if (!founded) {
            console.log("Not duplicated: " + rem_graph_name);
            not_duplicated.push(current_graph);
        }
    }
    listElements(not_duplicated);
}

/*
 * Gets the persistent local file system to access the device storage.
 */
function getFS() {
    console.log("Getting FS");
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
        console.log("FileSystem succesfully got");
        fs.root.getDirectory(localStorage.path_root_dir, {create: true}, function(dir) {
            root_dir = dir;
            console.log("FileSystem root got");
            getLocalGraphList();
        }, fileError);
    }, function() {
        console.log("Error requesting FS");
        fileError();
    });
}

/*
 * Starts initializing the page.
 */
function init() {
    console.log("--------- Initializing ScriptsList Page----------");
    user_profile = JSON.parse(localStorage.user_profile);
    getFS();
}

/*
 * Lists the given by parameter scripts, parsing them and filtering the
 * non appropiated scripts by user profile, to create the HTML element
 * to represent it.
 * 
 * @param XMLelements
 *              XML elements with the profile info of the scripts to list.
 */
function listElements(XMLelements) {
    for (var i = 0; i < XMLelements.length; ++i) {
        var actualXMLelement = XMLelements[i];
        var name = actualXMLelement.getElementsByTagName('name')[0].textContent.trim();
        console.log("Creating element for graph " + (i + 1) + " of " + XMLelements.length + ": " + name);
        var studies = actualXMLelement.getElementsByTagName('level')[0].textContent.trim();
        var sex = actualXMLelement.getElementsByTagName('sex')[0].textContent.trim();
        var min_age = actualXMLelement.getElementsByTagName('minage')[0].textContent.trim();
        var max_age = actualXMLelement.getElementsByTagName('maxage')[0].textContent.trim();
        var date = actualXMLelement.getElementsByTagName('date')[0].textContent.trim();
        var description = actualXMLelement.getElementsByTagName('description')[0].textContent.trim();
        var imageprofile = actualXMLelement.getElementsByTagName('imageprofile')[0].textContent.trim();
        imageprofile = replaceAll(imageprofile, "\\", "/");
        //Comprobamos si es adecuado el guion para el perfil de usuario
        if (min_age <= user_profile.age && max_age >= user_profile.age ||
                min_age == 0 && max_age == 0) {
            if (sex == user_profile.sex || sex == "Ambos") {
                if (studies == user_profile.studies ||
                        studies.length == 0) {
                    createElement(name, description, date, imageprofile);
                }
            }
        }
    }
}

/*
 * Create a HTML 'div' element to content the elements that shows
 * the name, synopsis, creation date and profile image of the script.
 * 
 * @param name
 *              name of the script.
 * @pàram decription
 *              synopsis of the script.
 * @param date
 *              creation date of the script.
 * @param image
 *              URI to script's profile image.
 */
function createElement(name, description, date, image) {
    var element = document.createElement("div");
    element.className = "graph_selection_button";
    //Profile image
    var image_elem = document.createElement("img");
    if (image != "") {
        image_elem.addEventListener('error', function() {
            image_elem.src = "./images/unavailable_script_icon.png";
        });
        root_dir.getFile(name + "/" + image, {create: false}, function(file_entry) {
            image_elem.src = file_entry.toURL();
        }, function() {
            image_elem.src = localStorage.URL_dir + name + "/" + image;
        });
    } else {
        image_elem.src = "./images/unavailable_script_icon.png";
    }

//Script info
    var name_elem = document.createElement("h1");
    name_elem.className = "script_name";
    name_elem.innerHTML = name;
    var description_elem = document.createElement("p");
    description_elem.innerHTML = description;
    var date_elem = document.createElement("footer");
    date_elem.innerHTML = "Creado el " + date;
    element.appendChild(image_elem);
    element.appendChild(name_elem);
    element.appendChild(description_elem);
    element.appendChild(date_elem);
    document.getElementById("scripts_list").appendChild(element);
    var graph_dir_route = localStorage.URL_dir + name;

    function showLoadingSelectedScriptAlert() {
        var info_box = document.getElementById("info_box");
        info_box.innerHTML = "Cargando guion seleccionado";
        document.getElementById("loading_scripts_splashscreen").style.display = "block";
    }
    element.addEventListener('click', function() {
        showLoadingSelectedScriptAlert();
        doVibrate();
        var script_info = {};
        script_info.name = name;
        script_info.dir_route = graph_dir_route;
        sessionStorage.script_info = JSON.stringify(script_info);
        createDirectories(name);
        if (image !== "") {
            storeProfileImageInFileSystem(script_info, image);
        }
        storeGraphInFileSystem(script_info);
    });
}

/*
 * Stores the remote graph into device local storage.
 * 
 * @param script_info
 *              info related to script to be stored.
 */
function storeGraphInFileSystem(script_info) {
    console.log("Storing '.graph' file of " + script_info.name);
    var graph_route = script_info.dir_route + "/" + script_info.name + ".graph";
    var graph_fullpath = script_info.name + "/" + script_info.name + ".graph";
    var petition = new XMLHttpRequest();
    petition.open('GET', graph_route, true);
    petition.timeout = 2000;
    var onFailurePetition = function() {
        console.log("Petition of graph " + script_info.name + " failure");
        root_dir.getFile(graph_fullpath, {create: false}, function() {
            location.href = "./scriptViewer.html";
        }, function() {
            alert("Imposible cargar el guión");
        });
    };
    petition.addEventListener('timeout', function() {
        console.log("TIMEOUT requesting remote graph " + script_info.name);
        petition.abort();
        onFailurePetition();
    });
    petition.addEventListener('load', function(e) {
        if (this.status == 200) {
            root_dir.getFile(graph_fullpath, {create: true}, function(file_entry) {
                file_entry.createWriter(function(fw) {
                    fw.onwrite = function() {
                        location.href = "./scriptViewer.html";
                    };
                    fw.write(e.target.responseText);
                }, fileError);
            }, fileError);
        } else {
            onFailurePetition();
        }
    });
    petition.addEventListener('error', onFailurePetition);
    petition.send();
}

/*
 * Sotre a script profile image into device local storage.
 * @param script_info
 *              script information.
 * @param image
 *              URL to image to be stored.
 */
function storeProfileImageInFileSystem(script_info, image) {
    var img_petition = new XMLHttpRequest();
    console.log("Storing profile image of " + script_info.name);
    img_petition.open('GET', script_info.dir_route + "/" + image);
    img_petition.responseType = 'arraybuffer';
    img_petition.timeout = 3000;
    img_petition.addEventListener('timeout', function() {
        console.log("TIMEOUT requesting image " + script_info.name);
        img_petition.abort();
    });
    img_petition.addEventListener('load',
            function(e) {
                if (this.status == 200) {
                    root_dir.getFile(script_info.name + "/" + image, {create: true}, function(file_entry) {
                        file_entry.createWriter(function(fw) {
                            fw.write(e.target.response);
                        }, fileError);
                    }, fileError);
                }
            });
    img_petition.addEventListener('error', function() {
    });
    img_petition.send();
}

/*
 * Crate the directories tree in device local storage to store the files
 * related to the script.
 * @param name
 *              name of the root directory of a script (usually, the script's name)
 */
function createDirectories(name) {
    root_dir.getDirectory(name, {create: true}, function() {
        root_dir.getDirectory(name + "/imagen", {create: true});
        root_dir.getDirectory(name + "/audio", {create: true});
        root_dir.getDirectory(name + "/video", {create: true});
    }, fileError);
}

/*
 * Determine the order of two elements by the alphabetical order
 * of thei script names.
 * @param a
 *              first element to be ordered. 
 * @param b
 *              second element to be ordered.
 */
function orderByScriptName(a, b) {
    var name_a = a.getElementsByTagName('name')[0].textContent;
    var name_b = b.getElementsByTagName('name')[0].textContent;
    if (name_a < name_b) {
        return -1;
    }
    if (name_a > name_b) {
        return 1;
    }
    return 0;
}

window.addEventListener('load', function() {
    document.addEventListener('deviceready', function() {
        init();
    });
});