/*
 * JavaScript error handlers.
 * 
 * @author David Miguel de la Fuente.
 * @version 0.1
 */

/*
 * Handler for erors of type "FileError".
 */
function fileError(e) {
    var msg = "";
    switch (e.code) {
    case FileError.NOT_FOUND_ERR:
        msg = "NOT_FOUND_ERR";
        break;
    case FileError.SECURITY_ERR:
        msg = "SECURITY_ERR";
        break;
    case FileError.ABORT_ERR:
        msg = "ABORT_ERR";
        break;
    case FileError.NOT_READABLE_ERR:
        msg = "NOT_READABLE_ERR";
        break;
    case FileError.ENCODING_ERR:
        msg = "ENCODING_ERR";
        break;
    case FileError.NO_MODIFICATION_ALLOWED_ERR:
        msg = "NO_MODIFICATION_ALLOWED_ERR";
        break;
    case FileError.INVALID_STATE_ERR:
        msg = "INVALID_STATE_ERR";
        break;
    case FileError.SYNTAX_ERR:
        msg = "SYNTAX_ERR_ERR";
        break;
    case FileError.INVALID_MODIFICATION_ERR:
        msg = "INVALID_MODIFICATION_ERR";
        break;
    case FileError.QUOTA_EXCEEDED_ERR:
        msg = "QUOTA_EXCEEDED_ERR";
        break;
    case FileError.TYPE_MISMATCH_ERR:
        msg = "TYPE_MISMATCH_ERR";
        break;
    case FileError.PATH_EXISTS_ERR:
        msg = "PATH_EXISTS_ERR";
        break;
    }
    console.log("FileError: " + msg);
    alert('Error de tratamiento de ficheros');
}

