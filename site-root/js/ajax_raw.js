function ajax_raw_async(url, method, data, callbackSuccess, callbackFailure) {
    if (method === void 0) { method = "GET"; }
    if (data === void 0) { data = null; }
    if (callbackSuccess === void 0) { callbackSuccess = null; }
    if (callbackFailure === void 0) { callbackFailure = null; }
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (req.readyState == XMLHttpRequest.DONE) {
            if (req.status == 200) {
                if (callbackSuccess != null) {
                    callbackSuccess(req.responseText);
                }
            }
            else {
                if (callbackFailure != null) {
                    callbackFailure(req);
                }
            }
        }
    };
    req.open(url, method, true);
    if (data == null) {
        req.send();
    }
    else {
        req.send(data);
    }
}
function ajax_raw_sync(url, method, data) {
    if (method === void 0) { method = "GET"; }
    if (data === void 0) { data = null; }
    var req = new XMLHttpRequest();
    req.open(method, url, false);
    if (data == null) {
        req.send();
    }
    else {
        req.send(data);
    }
    return req.responseText;
}
