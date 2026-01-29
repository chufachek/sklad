window.Modal = (function(){
    var overlay;
    var active;

    function ensure(){
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.addEventListener('click', function(e){
                if (e.target === overlay) {
                    close();
                }
            });
            document.body.appendChild(overlay);
            document.addEventListener('keydown', function(e){
                if (!active) {
                    return;
                }
                if (e.key === 'Escape') {
                    close();
                }
                if (e.key === 'Enter') {
                    var primary = overlay.querySelector('[data-modal-confirm]');
                    if (primary) {
                        primary.click();
                    }
                }
            });
        }
    }

    function open(options){
        ensure();
        overlay.innerHTML = '';
        var modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = options.content || '';
        overlay.appendChild(modal);
        overlay.style.display = 'flex';
        active = modal;
    }

    function close(){
        if (!overlay) {
            return;
        }
        overlay.style.display = 'none';
        overlay.innerHTML = '';
        active = null;
    }

    return {
        open: open,
        close: close
    };
})();
