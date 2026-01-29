window.Breadcrumbs = (function(){
    var labels = {
        dashboard: 'Дашборд',
        pos: 'Касса',
        warehouses: 'Склады',
        products: 'Товары',
        orders: 'Заказы',
        services: 'Услуги',
        company: 'Компания',
        profile: 'Профиль',
        income: 'Приход'
    };

    function getCompanyName(){
        var company = State.get('activeCompany', null);
        return company ? company.name : 'Компания';
    }

    function getWarehouseName(){
        var warehouse = State.get('activeWarehouse', null);
        return warehouse ? warehouse.name : 'Склад';
    }

    function render(){
        var container = document.getElementById('breadcrumbs');
        if (!container) {
            return;
        }
        var page = document.body.getAttribute('data-page') || '';
        var crumbs = [{ label: 'Главная', href: '/dashboard' }];
        if (page && labels[page]) {
            crumbs.push({ label: labels[page], href: '/' + page });
        }

        if (page === 'warehouses' || page === 'products' || page === 'income') {
            crumbs.splice(1, 0, { label: getCompanyName(), href: '/company' });
        }

        if (page === 'products' || page === 'income') {
            crumbs.push({ label: getWarehouseName(), href: '/warehouses' });
        }

        if (page === 'orders' && window.location.pathname.indexOf('/orders/') === 0) {
            var orderId = window.location.pathname.split('/')[2];
            crumbs.push({ label: 'Заказ «' + orderId + '»' });
        }

        var html = crumbs.map(function(crumb, index){
            var isLast = index === crumbs.length - 1;
            if (isLast || !crumb.href) {
                return '<span>' + crumb.label + '</span>';
            }
            return '<a href="' + crumb.href + '">' + crumb.label + '</a>';
        }).join(' / ');
        container.innerHTML = html;
    }

    return {
        render: render
    };
})();
