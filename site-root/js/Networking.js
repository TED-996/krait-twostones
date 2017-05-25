var WegasNetworking = (function () {
    function WegasNetworking() {
        this.socket = new WebSocket(WegasNetworking.get_websocket_url("/gameplay_ws"), "WegasNetworking");
        this.in_queue = [];
        var self = this;
        this.socket.onopen = function () { return self.onOpen(); };
        this.socket.onclose = function (ev) { return self.onClose(ev); };
        this.socket.onmessage = function (ev) { return self.onMessage(ev); };
        this.socket.onerror = function () { return self.onError(); };
    }
    WegasNetworking.get_websocket_url = function (absolute_url) {
        var loc = window.location;
        var new_uri;
        if (loc.protocol === "https:") {
            new_uri = "wss:";
        }
        else {
            new_uri = "ws:";
        }
        new_uri += "//" + loc.host;
        new_uri += absolute_url;
        return new_uri;
    };
    WegasNetworking.prototype.onOpen = function () {
        this.opened = true;
    };
    WegasNetworking.prototype.onMessage = function (ev) {
        this.in_queue.push(JSON.parse(ev.data));
    };
    WegasNetworking.prototype.onClose = function (ev) {
        this.opened = false;
    };
    //noinspection JSMethodCanBeStatic
    WegasNetworking.prototype.onError = function () {
        console.error("Websocket connection: unexpected error.");
    };
    WegasNetworking.prototype.send = function (type, data) {
        if (data === void 0) { data = null; }
        if (data != null) {
            var outObj = {
                type: type,
                data: data
            };
            this.socket.send(JSON.stringify(outObj));
        }
        else {
            var outObj = {
                type: type
            };
            this.socket.send(JSON.stringify(outObj));
        }
    };
    WegasNetworking.prototype.sendJoin = function () {
        this.send("join", AuthUtils.getUsername());
    };
    return WegasNetworking;
}());
