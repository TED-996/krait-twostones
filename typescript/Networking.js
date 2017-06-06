var WebsocketResponseWaitItem = (function () {
    function WebsocketResponseWaitItem(onClose) {
        this.data = null;
        this.onClose = onClose;
        this.refcount = 1;
        this.closed = false;
        this.onComplete = null;
    }
    WebsocketResponseWaitItem.prototype.copy = function () {
        var self = this;
        this.refcount++;
        return new WebsocketResponseWaitItem(function () { return self.refClose; });
    };
    WebsocketResponseWaitItem.prototype.getData = function () {
        return this.data;
    };
    WebsocketResponseWaitItem.prototype.setData = function (value) {
        this.data = value;
        if (value !== null && this.onComplete !== null) {
            this.onComplete(value);
        }
    };
    WebsocketResponseWaitItem.prototype.setOnComplete = function (onComplete) {
        this.onComplete = onComplete;
        if (this.data !== null) {
            this.onComplete(this.data);
        }
    };
    WebsocketResponseWaitItem.prototype.close = function () {
        if (!this.closed) {
            this.refClose();
            this.closed = true;
        }
    };
    WebsocketResponseWaitItem.prototype.refClose = function () {
        if (this.refcount <= 0) {
            throw new Error("WebsocketResponseWaitItem: too many close()s.");
        }
        this.refcount--;
        if (this.refcount == 0) {
            this.onClose();
        }
    };
    return WebsocketResponseWaitItem;
}());
function isUndefined(value) {
    return typeof value == "undefined";
}
var WegasNetworking = (function () {
    function WegasNetworking(onMessage) {
        if (onMessage === void 0) { onMessage = null; }
        this.socket = new WebSocket(WegasNetworking.getWebsocketUrl("/gameplay_ws"), "WegasNetworking");
        this.inQueue = [];
        this.responseWaitQueue = Object.create(null);
        this.onMessage = onMessage;
        var self = this;
        this.socket.onopen = function () { return self.onOpen(); };
        this.socket.onclose = function (ev) { return self.onClose(ev); };
        this.socket.onmessage = function (ev) { return self.onMessageInternal(ev); };
        this.socket.onerror = function () { return self.onError(); };
    }
    WegasNetworking.getWebsocketUrl = function (absolute_url) {
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
    WegasNetworking.prototype.onMessageInternal = function (ev) {
        var inObj = JSON.parse(ev.data);
        if (!isUndefined(inObj.tag) && !isUndefined(this.responseWaitQueue[inObj.tag])) {
            this.responseWaitQueue[inObj.tag].setData(inObj);
        }
        else if (this.onMessage != null) {
            this.onMessage(inObj);
        }
        else {
            this.inQueue.push(inObj);
        }
    };
    WegasNetworking.prototype.onClose = function (ev) {
        this.opened = false;
    };
    //noinspection JSMethodCanBeStatic
    WegasNetworking.prototype.onError = function () {
        console.error("Websocket connection: unexpected error.");
    };
    WegasNetworking.prototype.send = function (type, data, tag) {
        var _this = this;
        if (data === void 0) { data = null; }
        if (tag === void 0) { tag = null; }
        if (!this.opened) {
            return null;
        }
        var outObj = {
            type: type
        };
        var responseWaitItem = null;
        if (data != null) {
            outObj.data = data;
        }
        if (tag != null) {
            outObj.tag = tag;
            responseWaitItem = new WebsocketResponseWaitItem(function () { return delete _this.responseWaitQueue[tag]; });
            this.responseWaitQueue[tag] = responseWaitItem;
        }
        this.socket.send(JSON.stringify(outObj));
        return responseWaitItem;
    };
    WegasNetworking.prototype.getMessage = function () {
        if (this.inQueue.length == 0) {
            return null;
        }
        else {
            return this.inQueue.shift();
        }
    };
    WegasNetworking.prototype.getResponse = function (tag) {
        var msg = this.responseWaitQueue[tag];
        if (isUndefined(msg)) {
            throw new Error("[WegasNetworking.getResponse()]: " +
                "Tag " + tag + " does not exist in response wait queue.");
        }
        if (msg.getData() === null) {
            return null;
        }
        else {
            var is_error = (msg.getData().type == "error");
            if (!isUndefined(msg.getData().data)) {
                return {
                    is_error: is_error,
                    message: msg.getData().data
                };
            }
            else {
                return {
                    is_error: is_error,
                    message: null
                };
            }
        }
    };
    WegasNetworking.prototype.sendJoin = function () {
        return this.send("join", AuthUtils.getUsername(), WegasNetworking.generateTag());
    };
    WegasNetworking.prototype.sendGetTroops = function () {
        return this.send("get_matchtroops", null, WegasNetworking.generateTag());
    };
    WegasNetworking.prototype.sendDisconnect = function (reason) {
        this.send("disconnect", reason);
    };
    WegasNetworking.prototype.sendEndTurn = function () {
        return this.send("end_turn", null, WegasNetworking.generateTag());
    };
    WegasNetworking.prototype.sendError = function (message) {
        this.send("error", message);
    };
    WegasNetworking.prototype.sendMove = function (from, to) {
        return this.send("move", { from: from, to: to }, WegasNetworking.generateTag());
    };
    WegasNetworking.prototype.sendAttack = function (from, to) {
        return this.send("attack", { from: from, to: to }, WegasNetworking.generateTag());
    };
    WegasNetworking.prototype.sendGetFlags = function () {
        return this.send("get_flags", null, WegasNetworking.generateTag());
    };
    WegasNetworking.generateTag = function (size) {
        if (size === void 0) { size = 10; }
        var result = "";
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < size; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };
    return WegasNetworking;
}());
