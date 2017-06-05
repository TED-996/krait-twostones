class WebsocketResponseWaitItem {
    private data : NetworkingMessage;
    private onClose : () => void;
    private refcount : number;
    private closed : boolean;
    private onComplete : (data : NetworkingMessage) => void;

    constructor(onClose : () => void) {
        this.data = null;
        this.onClose = onClose;
        this.refcount = 1;
        this.closed = false;
        this.onComplete = null;
    }

    public copy() : WebsocketResponseWaitItem {
        let self = this;
        this.refcount++;
        return new WebsocketResponseWaitItem(() => self.refClose);
    }

    public getData(): NetworkingMessage {
        return this.data;
    }

    public setData(value: NetworkingMessage) {
        this.data = value;
        if (value !== null && this.onComplete !== null){
            this.onComplete(value);
        }
    }

    public setOnComplete(onComplete : (data : NetworkingMessage) => void){
        this.onComplete = onComplete;
        if (this.data !== null){
            this.onComplete(this.data);
        }
    }

    public close() : void {
        if (!this.closed) {
            this.refClose();
            this.closed = true;
        }
    }

    private refClose() : void {
        if (this.refcount <= 0){
            throw new Error("WebsocketResponseWaitItem: too many close()s.");
        }
        this.refcount--;
        if (this.refcount == 0){
            this.onClose();
        }
    }
}

function isUndefined(value) {
    return typeof value == "undefined";
}

interface NetworkingMessage {
    type : string;
    data?: any,
    tag?: any
}

class WegasNetworking {
    private socket : WebSocket;
    private inQueue : string[];
    private responseWaitQueue : {[tag: string]: WebsocketResponseWaitItem};
    private opened : boolean;
    public onMessage : (data : NetworkingMessage) => void;

    private static getWebsocketUrl(absolute_url) {
        const loc = window.location;
        let new_uri;
        if (loc.protocol === "https:") {
            new_uri = "wss:";
        } else {
            new_uri = "ws:";
        }
        new_uri += "//" + loc.host;
        new_uri += absolute_url;
        return new_uri;
    }

    public constructor(onMessage : (data : NetworkingMessage) => void = null) {
        this.socket = new WebSocket(WegasNetworking.getWebsocketUrl("/gameplay_ws"), "WegasNetworking");
        this.inQueue = [];
        this.responseWaitQueue = Object.create(null);

        this.onMessage = onMessage;

        let self = this;

        this.socket.onopen = () => self.onOpen();
        this.socket.onclose = (ev) => self.onClose(ev);
        this.socket.onmessage = (ev) => self.onMessageInternal(ev);
        this.socket.onerror = () => self.onError();

    }

    private onOpen() {
        this.opened = true;
    }

    private onMessageInternal(ev : MessageEvent) {
        let inObj = JSON.parse(ev.data);

        if (!isUndefined(inObj.tag) && !isUndefined(this.responseWaitQueue[inObj.tag])){
            this.responseWaitQueue[inObj.tag].setData(inObj);
        }
        else if (this.onMessage != null){
            this.onMessage(inObj);
        }
        else {
            this.inQueue.push(inObj);
        }
    }

    private onClose(ev : CloseEvent) {
        this.opened = false;
    }

    //noinspection JSMethodCanBeStatic
    private onError() {
        console.error("Websocket connection: unexpected error.")
    }


    private send(type : string, data : any = null, tag : string = null) : WebsocketResponseWaitItem {
        let outObj : NetworkingMessage = {
            type: type
        };
        let responseWaitItem : WebsocketResponseWaitItem = null;

        if (data != null){
            outObj.data = data;
        }
        if (tag != null){
            outObj.tag = tag;
            responseWaitItem = new WebsocketResponseWaitItem(() => delete this.responseWaitQueue[tag]);
            this.responseWaitQueue[tag] = responseWaitItem;
        }

        this.socket.send(JSON.stringify(outObj));

        return responseWaitItem;
    }

    private getMessage() : any {
        if (this.inQueue.length == 0){
            return null;
        }
        else {
            return this.inQueue.shift();
        }
    }

    private getResponse(tag : string) : {is_error : boolean, message : any} {
        let msg : any = this.responseWaitQueue[tag];

        if (isUndefined(msg)){
            throw new Error("[WegasNetworking.getResponse()]: " +
                "Tag " + tag + " does not exist in response wait queue.");
        }
        if (msg.getData() === null){
            return null;
        }
        else{
            let is_error = (msg.getData().type == "error");
            if (!isUndefined(msg.getData().data)){
                return {
                    is_error: is_error,
                    message: msg.getData().data
                };
            }
            else{
                return {
                    is_error: is_error,
                    message: null
                };
            }
        }
    }

    public sendJoin() : WebsocketResponseWaitItem {
        if (!this.opened){
            return null;
        }
        return this.send("join", AuthUtils.getUsername(), WegasNetworking.generateTag());
    }

    public sendGetTroops() : WebsocketResponseWaitItem {
        if (!this.opened){
            return null;
        }
        return this.send("get_matchtroops", null, WegasNetworking.generateTag());
    }

    public sendDisconnect(reason : string) : void {
        this.send("disconnect", reason)
    }

    public sendEndTurn() : WebsocketResponseWaitItem {
        return this.send("end_turn", null, WegasNetworking.generateTag());
    }

    public sendError(message : string) : void {
        this.send("error", message)
    }

    public sendMove(from : Coord, to : Coord)
            : WebsocketResponseWaitItem {
        return this.send("move", {from: from, to: to}, WegasNetworking.generateTag());
    }

    private static generateTag(size : number = 10) : string {
        let result = "";
        let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < size; i++ ) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return result;
    }
}
