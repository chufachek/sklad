window.Select = (function(){
    var registry = {};

    function init(){
        document.querySelectorAll('.custom-select').forEach(function(select){
            var trigger = select.querySelector('.select-trigger');
            trigger.addEventListener('click', function(){
                select.classList.toggle('open');
            });
        });
        document.addEventListener('click', function(e){
            document.querySelectorAll('.custom-select').forEach(function(select){
                if (!select.contains(e.target)) {
                    select.classList.remove('open');
                }
            });
        });
    }

    function setOptions(key, items, selectedId, placeholder){
        var select = document.querySelector('.custom-select[data-select="' + key + '"]');
        if (!select) {
            return;
        }
        var dropdown = select.querySelector('.select-dropdown');
        dropdown.innerHTML = '';
        if (!items.length) {
            dropdown.innerHTML = '<div class="select-option">' + (placeholder || 'Пусто') + '</div>';
            select.querySelector('.select-trigger').textContent = placeholder || 'Нет данных';
            return;
        }
        items.forEach(function(item){
            var option = document.createElement('div');
            option.className = 'select-option' + (item.id === selectedId ? ' active' : '');
            option.textContent = item.name;
            option.addEventListener('click', function(){
                select.classList.remove('open');
                select.querySelectorAll('.select-option').forEach(function(opt){ opt.classList.remove('active'); });
                option.classList.add('active');
                select.querySelector('.select-trigger').textContent = item.name;
                if (registry[key]) {
                    registry[key](item);
                }
            });
            dropdown.appendChild(option);
        });
        var selected = items.filter(function(item){ return item.id === selectedId; })[0] || items[0];
        select.querySelector('.select-trigger').textContent = selected ? selected.name : (placeholder || 'Выбрать');
    }

    function onChange(key, cb){
        registry[key] = cb;
    }

    return {
        init: init,
        setOptions: setOptions,
        onChange: onChange
    };
})();
