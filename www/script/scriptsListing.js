/*
 * JavaScript code related to listaGuiones.html page.
 * 
 * @author David Miguel de la Fuente.
 * @version 0.4
 */

var user_profile;
var root_dir;
/*
 * Explore the device storage root for the app files to find '.graphs' files.
 */
function getLocalGraphList() {
    var root_dir_reader = root_dir.createReader(),
            graphs_founded = 0, graphs_readed =  0,
            graphs_profiles = [];
    console.log("Starting to explore filesystem for local graphs");
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
                ++graphs_founded;
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
        if(entries.length == 0){
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
            graphs_profiles.push(XMLprofile[0]);
            ++graphs_readed;
            if (graphs_readed == graphs_founded) {
                finishLocalSearch();
            }
        };
        fr.onerror = function() {
            console.log("Reading error from graph " + entry.name);
        };
        fr.readAsText(file);
    }
    /*
     * Stopped the searching, starting to generate the representation of the
     * graphs' buttons and the remote search of graphs.
     */
    function finishLocalSearch() {
        listElements(graphs_profiles);
        getRemoteGraphList();
    }
    root_dir_reader.readEntries(readRootDirectory, fileError);
}
/*
 * Get the XML file in remote server, whose URL is given as a global variable,
 * that content the info of the available scripts.
 */
function getRemoteGraphList() {
    console.log("Trying to get remote graphs list " + localStorage.URL_dir + "list.xml");
    var list;
    var peticion = new XMLHttpRequest();
    peticion.timeout = 500;
    peticion.open("GET", localStorage.URL_dir + "list.xml");
    peticion.addEventListener('load', function(e) {
        console.log("Remote graphs list succesfully got");
        list = e.target.responseXML;
        list = list.getElementsByTagName('profile');
        listElements(list);
    }, false);
    peticion.send();
}
/*
 * Gets the persistent local file system to access the device storage.
 */
function getFS() {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
        fs.root.getDirectory(localStorage.path_root_dir, {create: true}, function(dir) {
            root_dir = dir;
            console.log("FileSystem succesfully got");
            local_graph_list = getLocalGraphList();
        }, fileError);
    }, FileError);
}
/*
 * Starts initializing the page.
 */
function init() {
    console.log("Initializing page");
    user_profile = JSON.parse(localStorage.user_profile);
    getFS();
}
/*
 * Lista los guiones leidos en el ficher pasado por parametro, parseandolos
 * y, en caso de ser adecuados al perfil de usuario, crear el elemento
 * HTML que lo representará en el listado.
 * 
 * @param XMLelements
 *              XML elements with the profile info of the scripts to list.
 */
function listElements(XMLelements) {
    console.log("Starting to create graphs' HTML elements and add them to DOM");
    var arrayElementosXML = Array.prototype.slice.call(XMLelements);
    arrayElementosXML.sort(orderByScriptName);
    for (var i = 0; i < arrayElementosXML.length; ++i) {
        var actualXMLelement = arrayElementosXML[i];
        var name = actualXMLelement.getElementsByTagName('name')[0].textContent.trim();
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
    element.class = "graph_selection_button";
    //Profile image
    var image_elem = document.createElement("img");
    image_elem.width = 50;
    image_elem.height = 50;
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
    name_elem.id = "script_name";
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
    element.onclick = function() {
        var script_info = new Object();
        script_info.name = name;
        script_info.dir_route = graph_dir_route;
        sessionStorage.script_info = JSON.stringify(script_info);
        createDirectories(name);
        if (image !== "") {
            storeProfileImageInFileSystem(script_info, image);
        }
        else {
            storeGraphInFileSystem(script_info);
        }
    };
}
/*
 * Stores the remote graph into device local storage.
 * 
 * @param script_info
 *              info related to script to be stored.
 */
function storeGraphInFileSystem(script_info) {
    var graph_route = script_info.dir_route + "/" + script_info.name + ".graph";
    var graph_fullpath = script_info.name + "/" + script_info.name + ".graph";
    var petition = new XMLHttpRequest();
    petition.open('GET', graph_route, true);
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
        }
    });
    petition.addEventListener('error', function() {
        root_dir.getFile(graph_fullpath, {create: false}, function() {
            location.href = "./scriptViewer.html";
        }, function() {
            alert("Imposible cargar el guión");
        });
    });
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
    img_petition.open('GET', script_info.dir_route + "/" + image, false);
    img_petition.responseType = 'arraybuffer';
    img_petition.addEventListener('load',
            function(e) {
                if (this.status == 200) {
                    root_dir.getFile(script_info.name + "/" + image, {create: true}, function(file_entry) {
                        file_entry.createWriter(function(fw) {
                            fw.onwrite = function() {
                                storeGraphInFileSystem(script_info);
                            };
                            fw.write(e.target.response);
                        }, fileError);
                    }
                    , fileError);
                } else {
                    storeGraphInFileSystem(script_info);
                }
            });
    img_petition.addEventListener('error', function() {
        storeGraphInFileSystem(script_info);
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
    }, FileError);
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
window.addEventListener('load', init);