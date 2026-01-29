window.PageModules = window.PageModules || {};
window.PageModules.pos = function(){
    var searchInput = document.getElementById('posSearch');
    var resultsContainer = document.getElementById('posResults');
    var receiptContainer = document.getElementById('posReceiptItems');
    var sumEl = document.getElementById('posSum');
    var totalEl = document.getElementById('posTotal');
    var paymentEl = document.getElementById('posPayment');
    var payBtn = document.getElementById('posPay');
    var saveBtn = document.getElementById('posSave');
    var clearBtn = document.getElementById('posClear');

    var items = [];
    var catalog = [];
    var services = [];
    var activePayment = 'cash';

    function loadCatalog(){
        var companyId = State.get('activeCompanyId', null);
        var warehouseId = State.get('activeWarehouseId', null);
        API.getProducts(companyId, warehouseId).then(function(res){
            catalog = res.ok ? res.data : [];
            renderResults('');
        });
        API.getServices().then(function(res){
            services = res.ok ? res.data : [];
        });
    }

    function renderResults(query){
        if (!resultsContainer) {
            return;
        }
        var value = (query || '').toLowerCase();
        if (!value) {
            resultsContainer.innerHTML = '<div class="list-empty">Введите запрос для поиска</div>';
            return;
        }
        var filtered = catalog.filter(function(item){
            return item.barcode.toLowerCase().indexOf(value) !== -1 ||
                item.sku.toLowerCase().indexOf(value) !== -1 ||
                item.name.toLowerCase().indexOf(value) !== -1;
        });
        var serviceMatches = services.filter(function(item){
            return item.name.toLowerCase().indexOf(value) !== -1;
        });
        var combined = filtered.map(function(item){
            return { type: 'product', data: item };
        }).concat(serviceMatches.map(function(item){
            return { type: 'service', data: item };
        }));
        if (!combined.length) {
            resultsContainer.innerHTML = '<div class="list-empty">Ничего не найдено</div>';
            return;
        }
        resultsContainer.innerHTML = combined.map(function(item){
            var price = item.data.price + ' ₽';
            return '<div class="result-item" data-id="' + item.data.id + '" data-type="' + item.type + '">' +
                '<div><strong>' + item.data.name + '</strong><div class="muted">' + (item.type === 'product' ? item.data.sku : 'Услуга') + '</div></div>' +
                '<div>' + price + '</div>' +
                '</div>';
        }).join('');
    }

    function addItem(type, data){
        var existing = items.filter(function(item){ return item.type === type && item.id === data.id; })[0];
        if (existing) {
            existing.qty += 1;
        } else {
            items.push({
                id: data.id,
                type: type,
                name: data.name,
                price: data.price,
                qty: 1,
                productId: type === 'product' ? data.id : null,
                serviceId: type === 'service' ? data.id : null
            });
        }
        renderReceipt();
        Toast.success('Добавлено в чек');
    }

    function renderReceipt(){
        if (!receiptContainer) {
            return;
        }
        if (!items.length) {
            receiptContainer.innerHTML = '<div class="list-empty">Чек пуст</div>';
            sumEl.textContent = '0 ₽';
            totalEl.textContent = '0 ₽';
            return;
        }
        var total = 0;
        receiptContainer.innerHTML = items.map(function(item){
            var line = item.price * item.qty;
            total += line;
            return '<div class="pos-item" data-id="' + item.id + '">' +
                '<div><strong>' + item.name + '</strong><div class="muted">' + item.qty + ' × ' + item.price + ' ₽</div></div>' +
                '<div class="item-actions">' +
                    '<button class="btn btn-light" data-action="dec">-</button>' +
                    '<button class="btn btn-light" data-action="inc">+</button>' +
                    '<button class="btn btn-light" data-action="remove">×</button>' +
                '</div>' +
                '</div>';
        }).join('');
        sumEl.textContent = total + ' ₽';
        totalEl.textContent = total + ' ₽';
    }

    function setPayment(){
        var payments = [
            { id: 'cash', label: 'Наличные 💵' },
            { id: 'card', label: 'Карта 💳' },
            { id: 'transfer', label: 'Перевод 🔁' }
        ];
        paymentEl.innerHTML = payments.map(function(pay){
            return '<button type="button" data-payment="' + pay.id + '">' + pay.label + '</button>';
        }).join('');
        paymentEl.querySelectorAll('button').forEach(function(btn){
            if (btn.getAttribute('data-payment') === activePayment) {
                btn.classList.add('active');
            }
            btn.addEventListener('click', function(){
                activePayment = btn.getAttribute('data-payment');
                paymentEl.querySelectorAll('button').forEach(function(b){ b.classList.remove('active'); });
                btn.classList.add('active');
            });
        });
    }

    function buildOrder(status){
        var companyId = State.get('activeCompanyId', null);
        var warehouseId = State.get('activeWarehouseId', null);
        var total = items.reduce(function(sum, item){ return sum + item.price * item.qty; }, 0);
        return {
            companyId: companyId,
            warehouseId: warehouseId,
            date: new Date().toISOString(),
            items: items.filter(function(item){ return item.type === 'product'; }).map(function(item){
                return { productId: item.id, qty: item.qty, price: item.price };
            }),
            services: items.filter(function(item){ return item.type === 'service'; }).map(function(item){
                return { serviceId: item.id, qty: item.qty, price: item.price };
            }),
            payment: activePayment,
            status: status,
            customerName: 'Незнакомый',
            total: total
        };
    }

    function submitOrder(status){
        if (!items.length) {
            Toast.warning('Добавьте позиции в чек');
            return;
        }
        API.createOrder(buildOrder(status)).then(function(res){
            if (!res.ok) {
                Toast.error(res.error.message || 'Ошибка сохранения');
                return;
            }
            Toast.success(status === 'paid' ? 'Оплата прошла' : 'Заказ сохранён');
            items = [];
            renderReceipt();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', function(){
            renderResults(searchInput.value);
        });
        searchInput.addEventListener('keydown', function(e){
            if (e.key === 'Enter') {
                var first = resultsContainer.querySelector('.result-item');
                if (first) {
                    var id = first.getAttribute('data-id');
                    var type = first.getAttribute('data-type');
                    var source = type === 'product' ? catalog : services;
                    var item = source.filter(function(i){ return i.id === id; })[0];
                    if (item) {
                        addItem(type, item);
                        searchInput.value = '';
                        renderResults('');
                    }
                }
            }
        });
    }

    if (resultsContainer) {
        resultsContainer.addEventListener('click', function(e){
            var item = e.target.closest('.result-item');
            if (!item) {
                return;
            }
            var id = item.getAttribute('data-id');
            var type = item.getAttribute('data-type');
            var source = type === 'product' ? catalog : services;
            var data = source.filter(function(i){ return i.id === id; })[0];
            if (data) {
                addItem(type, data);
                searchInput.value = '';
                renderResults('');
            }
        });
    }

    if (receiptContainer) {
        receiptContainer.addEventListener('click', function(e){
            var action = e.target.getAttribute('data-action');
            if (!action) {
                return;
            }
            var itemId = e.target.closest('.pos-item').getAttribute('data-id');
            var item = items.filter(function(i){ return i.id === itemId; })[0];
            if (!item) {
                return;
            }
            if (action === 'dec') {
                item.qty = Math.max(1, item.qty - 1);
            }
            if (action === 'inc') {
                item.qty += 1;
            }
            if (action === 'remove') {
                items = items.filter(function(i){ return i.id !== itemId; });
            }
            renderReceipt();
        });
    }

    if (payBtn) {
        payBtn.addEventListener('click', function(){ submitOrder('paid'); });
    }
    if (saveBtn) {
        saveBtn.addEventListener('click', function(){ submitOrder('draft'); });
    }
    if (clearBtn) {
        clearBtn.addEventListener('click', function(){ items = []; renderReceipt(); });
    }

    document.addEventListener('keydown', function(e){
        if (e.key === '/' && searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
        if (e.key === 'Enter' && e.ctrlKey) {
            submitOrder('paid');
        }
    });

    setPayment();
    loadCatalog();
    renderReceipt();
    document.addEventListener('contextChanged', loadCatalog);
};
