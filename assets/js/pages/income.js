window.PageModules = window.PageModules || {};
window.PageModules.income = function(){
    var tableContainer = document.getElementById('incomeTable');
    var addRowBtn = document.getElementById('addIncomeRow');
    var saveBtn = document.getElementById('saveIncome');
    var totalEl = document.getElementById('incomeTotal');
    var searchInput = document.getElementById('incomeSearch');

    var products = [];
    var items = [];

    function loadProducts(){
        var companyId = State.get('activeCompanyId', null);
        API.getProducts(companyId, null).then(function(res){
            products = res.ok ? res.data : [];
        });
        API.getWarehouses(companyId).then(function(res){
            var warehouses = res.ok ? res.data : [];
            Select.setOptions('incomeWarehouse', warehouses, State.get('activeWarehouseId', null), 'Выбрать склад');
            Select.onChange('incomeWarehouse', function(warehouse){
                State.set('activeWarehouseId', warehouse.id);
                State.set('activeWarehouse', warehouse);
                Breadcrumbs.render();
            });
        });
    }

    function renderTable(){
        if (!items.length) {
            tableContainer.innerHTML = '<div class="list-empty">Добавьте товары в приход</div>';
            totalEl.textContent = '0 ₽';
            return;
        }
        var html = '<table class="table"><thead><tr><th>Товар</th><th>Количество</th><th>Цена</th><th></th></tr></thead><tbody>';
        var total = 0;
        items.forEach(function(item){
            var line = item.qty * item.price;
            total += line;
            html += '<tr data-id="' + item.id + '">' +
                '<td>' + item.name + '</td>' +
                '<td><input type="text" class="inline-input" data-field="qty" value="' + item.qty + '"></td>' +
                '<td><input type="text" class="inline-input" data-field="price" value="' + item.price + '"></td>' +
                '<td><button class="btn btn-light" data-action="remove">Удал</button></td>' +
                '</tr>';
        });
        html += '</tbody></table>';
        tableContainer.innerHTML = html;
        totalEl.textContent = total + ' ₽';
    }

    function addItem(product){
        var existing = items.filter(function(i){ return i.id === product.id; })[0];
        if (existing) {
            existing.qty += 1;
        } else {
            items.push({ id: product.id, name: product.name, qty: 1, price: product.price, productId: product.id });
        }
        renderTable();
    }

    if (searchInput) {
        Autocomplete.attach(searchInput, function(query){
            return products.filter(function(item){
                var q = query.toLowerCase();
                return item.name.toLowerCase().indexOf(q) !== -1 || item.barcode.indexOf(q) !== -1 || item.sku.toLowerCase().indexOf(q) !== -1;
            });
        }, function(item){
            return '<strong>' + item.name + '</strong><div class="muted">' + item.sku + '</div>';
        }, function(item){
            addItem(item);
            searchInput.value = '';
        });
    }

    if (addRowBtn) {
        addRowBtn.addEventListener('click', function(){
            if (!products.length) {
                Toast.warning('Нет товаров');
                return;
            }
            addItem(products[0]);
        });
    }

    if (tableContainer) {
        tableContainer.addEventListener('input', function(e){
            var field = e.target.getAttribute('data-field');
            if (!field) {
                return;
            }
            var row = e.target.closest('tr');
            var id = row.getAttribute('data-id');
            var item = items.filter(function(i){ return i.id === id; })[0];
            if (!item) {
                return;
            }
            item[field] = Number(e.target.value) || 0;
            renderTable();
        });
        tableContainer.addEventListener('click', function(e){
            var action = e.target.getAttribute('data-action');
            if (action === 'remove') {
                var row = e.target.closest('tr');
                var id = row.getAttribute('data-id');
                items = items.filter(function(i){ return i.id !== id; });
                renderTable();
            }
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', function(){
            var warehouseId = State.get('activeWarehouseId', null);
            var companyId = State.get('activeCompanyId', null);
            if (!warehouseId) {
                Toast.warning('Выберите склад');
                return;
            }
            if (!items.length) {
                Toast.warning('Добавьте позиции');
                return;
            }
            var total = items.reduce(function(sum, item){ return sum + item.qty * item.price; }, 0);
            var payload = {
                companyId: companyId,
                warehouseId: warehouseId,
                date: new Date().toISOString(),
                supplier: document.querySelector('[name="supplier"]').value || 'Поставщик',
                items: items.map(function(item){
                    return { productId: item.productId, qty: item.qty, price: item.price };
                }),
                total: total
            };
            API.createIncome(payload).then(function(res){
                if (!res.ok) {
                    Toast.error(res.error.message || 'Ошибка сохранения');
                    return;
                }
                Toast.success('Приход сохранён');
                items = [];
                renderTable();
            });
        });
    }

    var dateInput = document.querySelector('[name="date"]');
    if (dateInput) {
        var today = new Date().toISOString().slice(0, 10);
        dateInput.value = today;
    }

    loadProducts();
    renderTable();
    document.addEventListener('contextChanged', function(){
        loadProducts();
        renderTable();
    });
};
