window.PageModules = window.PageModules || {};
window.PageModules.profile = function(){
    var infoContainer = document.getElementById('profileInfo');
    var companiesContainer = document.getElementById('profileCompanies');
    var tariffContainer = document.getElementById('profileTariff');

    function renderUser(){
        var user = JSON.parse(localStorage.getItem('user') || '{}');
        infoContainer.innerHTML = '<div class="card-header"><h2>Пользователь</h2></div>' +
            '<div class="card-body"><p><strong>' + (user.name || 'Пользователь') + '</strong></p><p class="muted">' + (user.email || '') + '</p></div>';
    }

    function renderCompanies(){
        API.getCompanies().then(function(res){
            var companies = res.ok ? res.data : [];
            var html = '<div class="card-header"><h2>Компании</h2></div><div class="card-body">';
            if (!companies.length) {
                html += '<div class="list-empty">Нет компаний</div>';
            } else {
                html += companies.map(function(company){
                    return '<div class="pos-item"><span>' + company.name + '</span><strong>' + (company.inn || '') + '</strong></div>';
                }).join('');
            }
            html += '<button class="btn btn-accent" id="profileCreateCompany">Создать компанию</button></div>';
            companiesContainer.innerHTML = html;
            var createBtn = document.getElementById('profileCreateCompany');
            if (createBtn) {
                createBtn.addEventListener('click', openCompanyModal);
            }
        });
    }

    function renderTariff(){
        API.getTariff().then(function(res){
            var tariff = res.ok ? res.data : { plan: 'Free', turnoverLimit: 100000 };
            var limits = {
                Free: { companies: 1, warehouses: 1, products: 50, turnover: '100 000 ₽/мес' },
                Trial: { companies: 3, warehouses: 3, products: 300, turnover: '500 000 ₽/мес' },
                Max: { companies: 'Unlimited', warehouses: 'Unlimited', products: 'Unlimited', turnover: 'Unlimited' }
            };
            var limit = limits[tariff.plan] || limits.Free;
            tariffContainer.innerHTML = '<div class="card-header" id="tariff"><h2>Тариф</h2></div>' +
                '<div class="card-body">' +
                '<p><strong>Текущий: ' + tariff.plan + '</strong></p>' +
                '<div class="grid grid-2">' +
                '<div class="badge">Компании: ' + limit.companies + '</div>' +
                '<div class="badge">Склады: ' + limit.warehouses + '</div>' +
                '<div class="badge">Товары: ' + limit.products + '</div>' +
                '<div class="badge">Оборот: ' + limit.turnover + '</div>' +
                '</div>' +
                '<button class="btn btn-secondary" id="upgradeTariff">Апгрейд</button>' +
                '</div>';
            var upgradeBtn = document.getElementById('upgradeTariff');
            if (upgradeBtn) {
                upgradeBtn.addEventListener('click', function(){
                    Toast.info('Оплата будет доступна в следующей версии');
                });
            }
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
                renderCompanies();
            });
        });
    }

    if (infoContainer) {
        renderUser();
    }
    if (companiesContainer) {
        renderCompanies();
    }
    if (tariffContainer) {
        renderTariff();
    }
};
