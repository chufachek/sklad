window.Toast = (function(){
    var container;

    function ensure(){
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    function show(message, type){
        ensure();
        var toast = document.createElement('div');
        toast.className = 'toast ' + (type || '');
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(function(){
            toast.remove();
        }, 3000);
    }

    return {
        success: function(msg){ show(msg, 'success'); },
        error: function(msg){ show(msg, 'danger'); },
        warning: function(msg){ show(msg, 'warning'); },
        info: function(msg){ show(msg, 'info'); }
    };
})();
