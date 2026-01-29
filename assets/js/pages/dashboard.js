window.PageModules = window.PageModules || {};
window.PageModules.dashboard = function(){
    var cardsContainer = document.getElementById('dashboardCards');
    var activityContainer = document.getElementById('activityList');
    var refreshBtn = document.getElementById('refreshDashboard');

    function render(){
        if (!cardsContainer) {
            return;
        }
        cardsContainer.innerHTML = '<div class="skeleton"></div>'.repeat(4);
        var companyId = State.get('activeCompanyId', null);
        API.getDashboard(companyId).then(function(res){
            if (!res.ok) {
                Toast.error('Не удалось загрузить дашборд');
                return;
            }
            var data = res.data;
            cardsContainer.innerHTML = '';
            var cards = [
                { title: 'Выручка', value: data.revenue + ' ₽' },
                { title: 'Продажи', value: data.sales },
                { title: 'Остатки', value: data.stock },
                { title: 'Операции', value: data.activity.length }
            ];
            cards.forEach(function(card){
                var el = document.createElement('div');
                el.className = 'card';
                el.innerHTML = '<h3>' + card.title + '</h3><strong>' + card.value + '</strong>';
                cardsContainer.appendChild(el);
            });
            if (!data.activity.length) {
                activityContainer.innerHTML = '<div class="list-empty">Нет операций</div>';
                return;
            }
            activityContainer.innerHTML = data.activity.map(function(item){
                return '<div class="pos-item"><span>Заказ ' + item.id + '</span><strong>' + item.total + ' ₽</strong></div>';
            }).join('');
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', render);
    }
    document.addEventListener('contextChanged', render);
    render();
};
