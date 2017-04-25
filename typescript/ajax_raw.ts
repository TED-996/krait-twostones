function ajax_raw_async(url : string, method : string = "GET", data : any = null,
        callbackSuccess : (string) => void = null,
        callbackFailure : (XMLHttpRequest) => void = null) {
    let req = new XMLHttpRequest();
    req.onreadystatechange = () =>{
        if (req.readyState == XMLHttpRequest.DONE){
            if (req.status == 200) {
                if (callbackSuccess != null){
                    callbackSuccess(req.responseText);
                }
            }
            else{
                if (callbackFailure != null){
                    callbackFailure(req);
                }
            }
        }
    };
    req.open(url, method, true);
    if (data == null) {
        req.send();
    }
    else{
        req.send(data);
    }
}

function ajax_raw_sync(url : string, method: string = "GET", data : any = null){
    let req = new XMLHttpRequest();
    req.open(method, url, false);
    if (data == null) {
        req.send();
    }
    else{
        req.send(data);
    }
    return req.responseText;
}