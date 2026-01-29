window.PageModules = window.PageModules || {};
window.PageModules.products = function(){
    var tableContainer = document.getElementById('productsTable');
    var searchInput = document.getElementById('productSearch');
    var createBtn = document.getElementById('createProduct');

    var products = [];
    var warehouses = [];

    function load(){
        Table.skeleton(tableContainer, 4);
        var companyId = State.get('activeCompanyId', null);
        var warehouseId = State.get('activeWarehouseId', null);
        API.getWarehouses(companyId).then(function(res){
            warehouses = res.ok ? res.data : [];
            Select.setOptions('productWarehouse', [{ id: '', name: 'Все склады' }].concat(warehouses), warehouseId || '', 'Все склады');
            State.set('productWarehouse', warehouseId || '');
        });
        API.getProducts(companyId, null).then(function(res){
            products = res.ok ? res.data : [];
            render();
        });
    }

    function render(){
        var query = searchInput ? searchInput.value.toLowerCase() : '';
        var selectedWarehouse = State.get('productWarehouse', '');
        var filtered = products.filter(function(product){
            var matches = product.barcode.toLowerCase().indexOf(query) !== -1 ||
                product.sku.toLowerCase().indexOf(query) !== -1 ||
                product.name.toLowerCase().indexOf(query) !== -1;
            var matchesWarehouse = !selectedWarehouse || product.warehouseId === selectedWarehouse;
            return matches && matchesWarehouse;
        });
        var columns = [
            { key: 'barcode', label: 'Штрихкод' },
            { key: 'sku', label: 'Артикул' },
            { key: 'name', label: 'Название' },
            { key: 'stock', label: 'Остаток' },
            { key: 'price', label: 'Цена', render: function(row){ return row.price + ' ₽'; } },
            { key: 'actions', label: 'Действия', render: function(row){
                return '<button class="btn btn-light" data-action="edit" data-id="' + row.id + '">Ред</button>' +
                    '<button class="btn btn-light" data-action="delete" data-id="' + row.id + '">Удал</button>';
            } }
        ];
        Table.render(tableContainer, columns, filtered, 'Товары не найдены');
    }

    function openModal(product){
        var isEdit = !!product;
        var html = '<div class="modal-header"><h3>' + (isEdit ? 'Редактировать' : 'Новый товар') + '</h3></div>' +
            '<form id="productForm" class="form">' +
            '<label>Склад<div class="custom-select" data-select="modalWarehouse"><button class="select-trigger" type="button">Выбрать склад</button><div class="select-dropdown"></div></div></label>' +
            '<label>Штрихкод<input type="text" name="barcode" value="' + (product ? product.barcode : '') + '" required></label>' +
            '<label>Артикул<input type="text" name="sku" value="' + (product ? product.sku : '') + '" required></label>' +
            '<label>Название<input type="text" name="name" value="' + (product ? product.name : '') + '" required></label>' +
            '<label>Цена<input type="text" name="price" value="' + (product ? product.price : '') + '" required></label>' +
            '<label>Остаток<input type="text" name="stock" value="' + (product ? product.stock : '') + '" required></label>' +
            '</form>' +
            '<div class="modal-actions">' +
            '<button class="btn btn-light" data-modal-close>Отмена</button>' +
            '<button class="btn btn-accent" data-modal-confirm>' + (isEdit ? 'Сохранить' : 'Создать') + '</button>' +
            '</div>';
        Modal.open({ content: html });
        Select.init();
        Select.onChange('modalWarehouse', function(item){
            State.set('modalWarehouseId', item.id);
        });
        if (warehouses.length) {
            var selected = product ? product.warehouseId : warehouses[0].id;
            State.set('modalWarehouseId', selected);
            Select.setOptions('modalWarehouse', warehouses, selected, 'Склад');
        }
        document.querySelector('[data-modal-close]').addEventListener('click', Modal.close);
        document.querySelector('[data-modal-confirm]').addEventListener('click', function(){
            var form = document.getElementById('productForm');
            var data = {
                warehouseId: State.get('modalWarehouseId', null),
                barcode: form.barcode.value,
                sku: form.sku.value,
                name: form.name.value,
                price: form.price.value,
                stock: form.stock.value
            };
            if (!data.warehouseId) {
                Toast.warning('Выберите склад');
                return;
            }
            var action = isEdit ? API.updateProduct(product.id, data) : API.createProduct(data);
            action.then(function(res){
                if (!res.ok) {
                    Toast.error(res.error.message || 'Ошибка сохранения');
                    return;
                }
                Modal.close();
                load();
            });
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', render);
    }

    Select.onChange('productWarehouse', function(warehouse){
        State.set('productWarehouse', warehouse.id);
        render();
    });

    if (tableContainer) {
        tableContainer.addEventListener('click', function(e){
            var action = e.target.getAttribute('data-action');
            var id = e.target.getAttribute('data-id');
            if (!action || !id) {
                return;
            }
            var product = products.filter(function(p){ return p.id === id; })[0];
            if (action === 'edit') {
                openModal(product);
            }
            if (action === 'delete') {
                API.deleteProduct(id).then(function(res){
                    if (!res.ok) {
                        Toast.error('Не удалось удалить');
                        return;
                    }
                    load();
                });
            }
        });
    }

    if (createBtn) {
        createBtn.addEventListener('click', function(){ openModal(null); });
    }

    document.addEventListener('contextChanged', load);
    load();
};
