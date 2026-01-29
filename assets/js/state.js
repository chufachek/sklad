window.State = (function(){
    var listeners = {};

    function read(key, fallback){
        var raw = localStorage.getItem(key);
        if (raw === null || raw === undefined) {
            return fallback;
        }
        try {
            return JSON.parse(raw);
        } catch (e) {
            return raw;
        }
    }

    function write(key, value){
        localStorage.setItem(key, JSON.stringify(value));
        notify(key, value);
    }

    function notify(key, value){
        if (!listeners[key]) {
            return;
        }
        listeners[key].forEach(function(cb){ cb(value); });
    }

    function subscribe(key, cb){
        if (!listeners[key]) {
            listeners[key] = [];
        }
        listeners[key].push(cb);
    }

    return {
        get: read,
        set: write,
        subscribe: subscribe
    };
})();
