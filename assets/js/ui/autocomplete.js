window.Autocomplete = (function(){
    function attach(input, dataProvider, renderItem, onSelect){
        var list = document.createElement('div');
        list.className = 'autocomplete-list';
        input.parentNode.appendChild(list);

        input.addEventListener('input', function(){
            var value = input.value.toLowerCase();
            if (!value) {
                list.innerHTML = '';
                return;
            }
            var items = dataProvider(value) || [];
            list.innerHTML = '';
            items.forEach(function(item){
                var option = document.createElement('div');
                option.className = 'result-item';
                option.innerHTML = renderItem(item);
                option.addEventListener('click', function(){
                    onSelect(item);
                    list.innerHTML = '';
                });
                list.appendChild(option);
            });
        });
    }

    return {
        attach: attach
    };
})();
