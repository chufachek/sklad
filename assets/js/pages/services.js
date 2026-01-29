window.PageModules = window.PageModules || {};
window.PageModules.services = function(){
    var tableContainer = document.getElementById('servicesTable');
    var createBtn = document.getElementById('createService');
    var services = [];

    function load(){
        Table.skeleton(tableContainer, 3);
        API.getServices().then(function(res){
            services = res.ok ? res.data : [];
            render();
        });
    }

    function render(){
        var columns = [
            { key: 'name', label: 'Название' },
            { key: 'price', label: 'Цена', render: function(row){ return row.price + ' ₽'; } },
            { key: 'durationMin', label: 'Длительность', render: function(row){ return row.durationMin + ' мин'; } },
            { key: 'actions', label: 'Действия', render: function(row){
                return '<button class="btn btn-light" data-action="edit" data-id="' + row.id + '">Ред</button>' +
                    '<button class="btn btn-light" data-action="delete" data-id="' + row.id + '">Удал</button>';
            } }
        ];
        Table.render(tableContainer, columns, services, 'Услуги отсутствуют');
    }

    function openModal(service){
        var isEdit = !!service;
        var html = '<div class="modal-header"><h3>' + (isEdit ? 'Редактировать услугу' : 'Новая услуга') + '</h3></div>' +
            '<form id="serviceForm" class="form">' +
            '<label>Название<input type="text" name="name" value="' + (service ? service.name : '') + '" required></label>' +
            '<label>Цена<input type="text" name="price" value="' + (service ? service.price : '') + '" required></label>' +
            '<label>Длительность (мин)<input type="text" name="durationMin" value="' + (service ? service.durationMin : '') + '"></label>' +
            '</form>' +
            '<div class="modal-actions">' +
            '<button class="btn btn-light" data-modal-close>Отмена</button>' +
            '<button class="btn btn-accent" data-modal-confirm>' + (isEdit ? 'Сохранить' : 'Создать') + '</button>' +
            '</div>';
        Modal.open({ content: html });
        document.querySelector('[data-modal-close]').addEventListener('click', Modal.close);
        document.querySelector('[data-modal-confirm]').addEventListener('click', function(){
            var form = document.getElementById('serviceForm');
            var data = {
                name: form.name.value,
                price: form.price.value,
                durationMin: form.durationMin.value
            };
            var action = isEdit ? API.updateService(service.id, data) : API.createService(data);
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
            var service = services.filter(function(s){ return s.id === id; })[0];
            if (action === 'edit') {
                openModal(service);
            }
            if (action === 'delete') {
                API.deleteService(id).then(function(res){
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

    load();
};
