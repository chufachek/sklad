window.PageModules = window.PageModules || {};
window.PageModules.warehouses = function(){
    var tableContainer = document.getElementById('warehousesTable');
    var createBtn = document.getElementById('createWarehouse');
    var warehouses = [];

    function load(){
        Table.skeleton(tableContainer, 3);
        var companyId = State.get('activeCompanyId', null);
        Promise.all([API.getWarehouses(companyId), API.getProducts(companyId, null)]).then(function(results){
            var warehouseRes = results[0];
            var productRes = results[1];
            warehouses = warehouseRes.ok ? warehouseRes.data : [];
            var products = productRes.ok ? productRes.data : [];
            warehouses.forEach(function(warehouse){
                warehouse.stockCount = products.filter(function(p){ return p.warehouseId === warehouse.id; }).length;
            });
            render();
        });
    }

    function render(){
        var columns = [
            { key: 'name', label: 'Название' },
            { key: 'address', label: 'Адрес' },
            { key: 'stock', label: 'Кол-во товаров', render: function(row){
                return row.stockCount || 0;
            } },
            { key: 'actions', label: 'Действия', render: function(row){
                return '<button class="btn btn-light" data-action="edit" data-id="' + row.id + '">Ред</button>' +
                    '<button class="btn btn-light" data-action="delete" data-id="' + row.id + '">Удал</button>';
            } }
        ];
        Table.render(tableContainer, columns, warehouses, 'Склады отсутствуют');
    }

    function openModal(warehouse){
        var isEdit = !!warehouse;
        var html = '<div class="modal-header"><h3>' + (isEdit ? 'Редактировать склад' : 'Новый склад') + '</h3></div>' +
            '<form id="warehouseForm" class="form">' +
            '<label>Название<input type="text" name="name" value="' + (warehouse ? warehouse.name : '') + '" required></label>' +
            '<label>Адрес<input type="text" name="address" value="' + (warehouse ? warehouse.address : '') + '" required></label>' +
            '</form>' +
            '<div class="modal-actions">' +
            '<button class="btn btn-light" data-modal-close>Отмена</button>' +
            '<button class="btn btn-accent" data-modal-confirm>' + (isEdit ? 'Сохранить' : 'Создать') + '</button>' +
            '</div>';
        Modal.open({ content: html });
        document.querySelector('[data-modal-close]').addEventListener('click', Modal.close);
        document.querySelector('[data-modal-confirm]').addEventListener('click', function(){
            var form = document.getElementById('warehouseForm');
            var data = {
                companyId: State.get('activeCompanyId', null),
                name: form.name.value,
                address: form.address.value
            };
            var action = isEdit ? API.updateWarehouse(warehouse.id, data) : API.createWarehouse(data);
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

    if (tableContainer) {
        tableContainer.addEventListener('click', function(e){
            var action = e.target.getAttribute('data-action');
            var id = e.target.getAttribute('data-id');
            if (!action || !id) {
                return;
            }
            var warehouse = warehouses.filter(function(w){ return w.id === id; })[0];
            if (action === 'edit') {
                openModal(warehouse);
            }
            if (action === 'delete') {
                API.deleteWarehouse(id).then(function(res){
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
