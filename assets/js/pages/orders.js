window.PageModules = window.PageModules || {};
window.PageModules.orders = function(){
    var tableContainer = document.getElementById('ordersTable');
    var createBtn = document.getElementById('createOrder');
    var detailContainer = document.getElementById('orderDetail');

    function loadList(){
        if (!tableContainer) {
            return;
        }
        Table.skeleton(tableContainer, 3);
        var companyId = State.get('activeCompanyId', null);
        API.getOrders(companyId).then(function(res){
            var orders = res.ok ? res.data : [];
            var columns = [
                { key: 'id', label: 'Номер' },
                { key: 'date', label: 'Дата', render: function(row){ return new Date(row.date).toLocaleString(); } },
                { key: 'total', label: 'Сумма', render: function(row){ return row.total + ' ₽'; } },
                { key: 'status', label: 'Статус', render: function(row){
                    var cls = row.status === 'paid' ? 'success' : (row.status === 'draft' ? 'warning' : 'danger');
                    return '<span class="badge ' + cls + '">' + row.status + '</span>';
                } },
                { key: 'actions', label: 'Действия', render: function(row){
                    return '<a class="btn btn-light" href="/orders/' + row.id + '">Открыть</a>';
                } }
            ];
            Table.render(tableContainer, columns, orders, 'Заказов пока нет');
        });
    }

    function loadDetail(){
        if (!detailContainer) {
            return;
        }
        var orderId = window.location.pathname.split('/')[2];
        Promise.all([API.getOrder(orderId), API.getProducts(State.get('activeCompanyId', null), null), API.getServices()]).then(function(results){
            var res = results[0];
            var products = results[1].ok ? results[1].data : [];
            var services = results[2].ok ? results[2].data : [];
            if (!res.ok) {
                detailContainer.innerHTML = '<div class="list-empty">Заказ не найден</div>';
                return;
            }
            var order = res.data;
            var itemsHtml = order.items.map(function(item){
                var product = products.filter(function(p){ return p.id === item.productId; })[0];
                return '<div class="pos-item"><span>' + (product ? product.name : item.productId) + '</span><strong>' + item.qty + ' × ' + item.price + ' ₽</strong></div>';
            }).join('');
            var servicesHtml = order.services.map(function(item){
                var service = services.filter(function(s){ return s.id === item.serviceId; })[0];
                return '<div class="pos-item"><span>' + (service ? service.name : item.serviceId) + '</span><strong>' + item.qty + ' × ' + item.price + ' ₽</strong></div>';
            }).join('');
            var html = '<div class="grid grid-2">' +
                '<div><h3>Товары</h3>' + (itemsHtml || '<div class="list-empty">Нет товаров</div>') + '</div>' +
                '<div><h3>Услуги</h3>' + (servicesHtml || '<div class="list-empty">Нет услуг</div>') + '</div>' +
                '</div>' +
                '<div class="summary-row"><span>Клиент</span><strong>' + (order.customerName || 'Незнакомый') + '</strong></div>' +
                '<div class="summary-row"><span>Оплата</span><strong>' + order.payment + '</strong></div>' +
                '<div class="summary-row"><span>Статус</span><strong>' + order.status + '</strong></div>' +
                '<div class="summary-row total"><span>Итого</span><strong>' + order.total + ' ₽</strong></div>';
            detailContainer.innerHTML = html;
        });
    }

    if (createBtn) {
        createBtn.addEventListener('click', function(){ window.location.href = '/pos'; });
    }

    if (tableContainer) {
        loadList();
    }
    if (detailContainer) {
        loadDetail();
    }
    document.addEventListener('contextChanged', loadList);
};
