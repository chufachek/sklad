window.PageModules = window.PageModules || {};
window.PageModules.company = function(){
    var infoContainer = document.getElementById('companyInfo');
    var tariffContainer = document.getElementById('companyTariff');
    var warehousesContainer = document.getElementById('companyWarehouses');
    var createBtn = document.getElementById('createCompany');

    function render(){
        var company = State.get('activeCompany', null);
        if (!company) {
            infoContainer.innerHTML = '<div class="card-body"><div class="list-empty">Нет компании</div></div>';
            return;
        }
        infoContainer.innerHTML = '<div class="card-header"><h2>' + company.name + '</h2></div>' +
            '<div class="card-body"><p>ИНН: ' + (company.inn || '—') + '</p></div>';
        API.getTariff().then(function(res){
            var tariff = res.ok ? res.data : { plan: 'Free', turnoverLimit: 100000 };
            tariffContainer.innerHTML = '<div class="card-header"><h2>Тариф</h2></div>' +
                '<div class="card-body"><p>План: <strong>' + tariff.plan + '</strong></p><p class="muted">Оборот: ' + (tariff.turnoverLimit || 100000) + ' ₽/мес</p></div>';
        });
        API.getWarehouses(company.id).then(function(res){
            var warehouses = res.ok ? res.data : [];
            if (!warehouses.length) {
                warehousesContainer.innerHTML = '<div class="list-empty">Склады отсутствуют</div>';
                return;
            }
            warehousesContainer.innerHTML = warehouses.map(function(warehouse){
                return '<div class="pos-item"><span>' + warehouse.name + '</span><span class="muted">' + warehouse.address + '</span></div>';
            }).join('');
        });
    }

    function openCompanyModal(){
        var html = '<div class="modal-header"><h3>Новая компания</h3></div>' +
            '<form id="companyForm" class="form">' +
            '<label>Название<input type="text" name="name" required></label>' +
            '<label>ИНН<input type="text" name="inn"></label>' +
            '</form>' +
            '<div class="modal-actions">' +
            '<button class="btn btn-light" data-modal-close>Отмена</button>' +
            '<button class="btn btn-accent" data-modal-confirm>Создать</button>' +
            '</div>';
        Modal.open({ content: html });
        document.querySelector('[data-modal-close]').addEventListener('click', Modal.close);
        document.querySelector('[data-modal-confirm]').addEventListener('click', function(){
            var form = document.getElementById('companyForm');
            var data = { name: form.name.value, inn: form.inn.value };
            API.createCompany(data).then(function(res){
                if (!res.ok) {
                    Toast.error(res.error.message || 'Ошибка создания');
                    return;
                }
                Modal.close();
                State.set('activeCompanyId', res.data.id);
                State.set('activeCompany', res.data);
                render();
            });
        });
    }

    if (createBtn) {
        createBtn.addEventListener('click', openCompanyModal);
    }

    render();
};
