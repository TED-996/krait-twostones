class WegasNetworking {
    socket : WebSocket;
    in_queue : string[];
    opened : boolean;

    private static get_websocket_url(absolute_url) {
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

    public constructor() {
        this.socket = new WebSocket(WegasNetworking.get_websocket_url("/gameplay_ws"), "WegasNetworking");
        this.in_queue = [];

        let self = this;

        this.socket.onopen = () => self.onOpen();
        this.socket.onclose = (ev) => self.onClose(ev);
        this.socket.onmessage = (ev) => self.onMessage(ev);
        this.socket.onerror = () => self.onError();
    }

    private onOpen() {
        this.opened = true;
    }

    private onMessage(ev : MessageEvent) {
        this.in_queue.push(JSON.parse(ev.data));
    }

    private onClose(ev : CloseEvent) {
        this.opened = false;
    }

    //noinspection JSMethodCanBeStatic
    private onError() {
        console.error("Websocket connection: unexpected error.")
    }
    private send(type : string, data : any = null) {
        if (data != null){
            let outObj = {
                type : type,
                data : data
            };
            this.socket.send(JSON.stringify(outObj))
        }
        else{
            let outObj = {
                type : type
            };
            this.socket.send(JSON.stringify(outObj));
        }
    }

    public sendJoin() {
        this.send("join", AuthUtils.getUsername());
    }


}
