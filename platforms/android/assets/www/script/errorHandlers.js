/*
 * JavaScript error handlers.
 * 
 * @author David Miguel de la Fuente.
 * @version 0.3
 */

/*
 * Handler for erors of type "FileError".
 */
function fileError(e) {
    console.log("FILE ERROR CAUGHT");
    var msg = "Error desconocido";
    var errorName = "Unidentified error";
    switch (e.code) {
    case FileError.NOT_FOUND_ERR:
        msg = "Archivo no encontrado";
        errorName = "NOT_FOUND_ERR";
        break;
    case FileError.SECURITY_ERR:
        errorName = "SECURITY_ERR";
        break;
    case FileError.ABORT_ERR:
        errorName = "ABORT_ERR";
        break;
    case FileError.NOT_READABLE_ERR:
        errorName = "NOT_READABLE_ERR";
        break;
    case FileError.ENCODING_ERR:
        errorName = "ENCODING_ERR";
        break;
    case FileError.NO_MODIFICATION_ALLOWED_ERR:
        errorName = "NO_MODIFICATION_ALLOWED_ERR";
        break;
    case FileError.INVALID_STATE_ERR:
        errorName = "INVALID_STATE_ERR";
        break;
    case FileError.SYNTAX_ERR:
        errorName = "SYNTAX_ERR_ERR";
        break;
    case FileError.INVALID_MODIFICATION_ERR:
        errorName = "INVALID_MODIFICATION_ERR";
        break;
    case FileError.QUOTA_EXCEEDED_ERR:
        errorName = "QUOTA_EXCEEDED_ERR";
        break;
    case FileError.TYPE_MISMATCH_ERR:
        errorName = "TYPE_MISMATCH_ERR";
        break;
    case FileError.PATH_EXISTS_ERR:
        errorName = "PATH_EXISTS_ERR";
        break;
    }
    console.log("FileError: " + errorName);
    navigator.notification.alert(msg, {}, "Error de archivos");
}

