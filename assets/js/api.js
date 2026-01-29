window.__MOCK__ = window.__MOCK__ !== false;

window.API = (function(){
    var STORAGE_KEY = 'es_db_v1';

    function delay(){
        var ms = 150 + Math.round(Math.random() * 200);
        return new Promise(function(resolve){
            setTimeout(resolve, ms);
        });
    }

    function seed(){
        var demoCompanyId = 'c1';
        var demoWarehouseId = 'w1';
        return {
            user: { id: 'u1', name: 'Демо пользователь', email: 'demo@easy.ru' },
            tariff: { plan: 'Free', turnoverLimit: 100000 },
            companies: [
                { id: demoCompanyId, name: 'Демо компания', inn: '7700000000', createdAt: Date.now() }
            ],
            warehouses: [
                { id: demoWarehouseId, companyId: demoCompanyId, name: 'Основной', address: 'Москва, ул. Примерная 1' }
            ],
            products: [
                { id: 'p1', warehouseId: demoWarehouseId, barcode: '4601234567890', sku: 'SKU-1001', name: 'Кофе зерновой', price: 590, stock: 24 },
                { id: 'p2', warehouseId: demoWarehouseId, barcode: '4609876543210', sku: 'SKU-1002', name: 'Чай зелёный', price: 340, stock: 32 },
                { id: 'p3', warehouseId: demoWarehouseId, barcode: '4812345678901', sku: 'SKU-1003', name: 'Сироп ванильный', price: 420, stock: 15 },
                { id: 'p4', warehouseId: demoWarehouseId, barcode: '4798765432109', sku: 'SKU-1004', name: 'Молоко 3.2%', price: 95, stock: 60 },
                { id: 'p5', warehouseId: demoWarehouseId, barcode: '4601111111111', sku: 'SKU-1005', name: 'Батон пшеничный', price: 65, stock: 40 },
                { id: 'p6', warehouseId: demoWarehouseId, barcode: '4602222222222', sku: 'SKU-1006', name: 'Сок апельсиновый', price: 120, stock: 28 },
                { id: 'p7', warehouseId: demoWarehouseId, barcode: '4603333333333', sku: 'SKU-1007', name: 'Печенье овсяное', price: 140, stock: 36 },
                { id: 'p8', warehouseId: demoWarehouseId, barcode: '4604444444444', sku: 'SKU-1008', name: 'Шоколад тёмный', price: 170, stock: 18 },
                { id: 'p9', warehouseId: demoWarehouseId, barcode: '4605555555555', sku: 'SKU-1009', name: 'Вода минеральная', price: 55, stock: 90 },
                { id: 'p10', warehouseId: demoWarehouseId, barcode: '4606666666666', sku: 'SKU-1010', name: 'Салфетки', price: 30, stock: 120 }
            ],
            services: [
                { id: 's1', name: 'Доставка', price: 300, durationMin: 0 },
                { id: 's2', name: 'Настройка кассы', price: 1500, durationMin: 60 },
                { id: 's3', name: 'Сборка заказа', price: 200, durationMin: 15 },
                { id: 's4', name: 'Печать этикеток', price: 100, durationMin: 5 }
            ],
            incomes: [],
            orders: [],
            counters: { company: 2, warehouse: 2, product: 11, service: 5, income: 1, order: 1 }
        };
    }

    function loadDb(){
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            var seeded = seed();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
            localStorage.setItem('tariffPlan', JSON.stringify(seeded.tariff));
            return seeded;
        }
        try {
            var parsed = JSON.parse(raw);
            localStorage.setItem('tariffPlan', JSON.stringify(parsed.tariff));
            return parsed;
        } catch (e) {
            var seeded = seed();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
            localStorage.setItem('tariffPlan', JSON.stringify(seeded.tariff));
            return seeded;
        }
    }

    function saveDb(db){
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
        localStorage.setItem('tariffPlan', JSON.stringify(db.tariff));
    }

    function response(ok, data, error){
        if (ok) {
            return { ok: true, data: data };
        }
        return { ok: false, error: error };
    }

    function getPlanLimits(plan){
        if (plan === 'Max') {
            return { companies: Infinity, warehousesPerCompany: Infinity, productsPerCompany: Infinity, turnover: Infinity };
        }
        if (plan === 'Trial') {
            return { companies: 3, warehousesPerCompany: 3, productsPerCompany: 300, turnover: 500000 };
        }
        return { companies: 1, warehousesPerCompany: 1, productsPerCompany: 50, turnover: 100000 };
    }

    function canCreateCompany(db){
        var limits = getPlanLimits(db.tariff.plan);
        return db.companies.length < limits.companies;
    }

    function canCreateWarehouse(db, companyId){
        var limits = getPlanLimits(db.tariff.plan);
        var count = db.warehouses.filter(function(w){ return w.companyId === companyId; }).length;
        return count < limits.warehousesPerCompany;
    }

    function canCreateProduct(db, companyId){
        var limits = getPlanLimits(db.tariff.plan);
        var warehouseIds = db.warehouses.filter(function(w){ return w.companyId === companyId; }).map(function(w){ return w.id; });
        var count = db.products.filter(function(p){ return warehouseIds.indexOf(p.warehouseId) !== -1; }).length;
        return count < limits.productsPerCompany;
    }

    function turnoverForMonth(db, companyId){
        var now = new Date();
        var month = now.getMonth();
        var year = now.getFullYear();
        var total = 0;
        db.orders.forEach(function(order){
            if (order.companyId !== companyId || order.status !== 'paid') {
                return;
            }
            var date = new Date(order.date);
            if (date.getMonth() === month && date.getFullYear() === year) {
                total += order.total;
            }
        });
        return total;
    }

    function mockRequest(handler){
        return delay().then(function(){
            return handler();
        });
    }

    function realRequest(method, path, data){
        return new Promise(function(resolve, reject){
            $.ajax({
                type: method,
                url: '/api/v1/' + path,
                data: data,
                success: function(res){ resolve(res); },
                error: function(err){ reject(err); }
            });
        });
    }

    function login(payload){
        if (!window.__MOCK__) {
            return realRequest('POST', 'auth/login', payload);
        }
        return mockRequest(function(){
            var db = loadDb();
            return response(true, { token: 'mock-token', user: db.user });
        });
    }

    function register(payload){
        if (!window.__MOCK__) {
            return realRequest('POST', 'auth/register', payload);
        }
        return mockRequest(function(){
            var db = loadDb();
            db.user = { id: 'u1', name: payload.name, email: payload.email };
            saveDb(db);
            return response(true, { token: 'mock-token', user: db.user });
        });
    }

    function getCompanies(){
        if (!window.__MOCK__) {
            return realRequest('GET', 'companies');
        }
        return mockRequest(function(){
            var db = loadDb();
            return response(true, db.companies);
        });
    }

    function createCompany(data){
        if (!window.__MOCK__) {
            return realRequest('POST', 'companies', data);
        }
        return mockRequest(function(){
            var db = loadDb();
            if (!canCreateCompany(db)) {
                return response(false, null, { message: 'Лимит компаний по тарифу исчерпан', code: 'TARIFF_LIMIT' });
            }
            var id = 'c' + db.counters.company++;
            var company = { id: id, name: data.name, inn: data.inn || '', createdAt: Date.now() };
            db.companies.push(company);
            saveDb(db);
            return response(true, company);
        });
    }

    function updateCompany(id, data){
        if (!window.__MOCK__) {
            return realRequest('PUT', 'companies/' + id, data);
        }
        return mockRequest(function(){
            var db = loadDb();
            var company = db.companies.filter(function(c){ return c.id === id; })[0];
            if (!company) {
                return response(false, null, { message: 'Компания не найдена', code: 'NOT_FOUND' });
            }
            company.name = data.name || company.name;
            company.inn = data.inn || company.inn;
            saveDb(db);
            return response(true, company);
        });
    }

    function deleteCompany(id){
        if (!window.__MOCK__) {
            return realRequest('DELETE', 'companies/' + id);
        }
        return mockRequest(function(){
            var db = loadDb();
            db.companies = db.companies.filter(function(c){ return c.id !== id; });
            db.warehouses = db.warehouses.filter(function(w){ return w.companyId !== id; });
            db.products = db.products.filter(function(p){ return db.warehouses.map(function(w){ return w.id; }).indexOf(p.warehouseId) !== -1; });
            saveDb(db);
            return response(true, true);
        });
    }

    function getWarehouses(companyId){
        if (!window.__MOCK__) {
            return realRequest('GET', 'warehouses?companyId=' + companyId);
        }
        return mockRequest(function(){
            var db = loadDb();
            var warehouses = db.warehouses.filter(function(w){ return !companyId || w.companyId === companyId; });
            return response(true, warehouses);
        });
    }

    function createWarehouse(data){
        if (!window.__MOCK__) {
            return realRequest('POST', 'warehouses', data);
        }
        return mockRequest(function(){
            var db = loadDb();
            if (!canCreateWarehouse(db, data.companyId)) {
                return response(false, null, { message: 'Лимит складов по тарифу исчерпан', code: 'TARIFF_LIMIT' });
            }
            var id = 'w' + db.counters.warehouse++;
            var warehouse = { id: id, companyId: data.companyId, name: data.name, address: data.address };
            db.warehouses.push(warehouse);
            saveDb(db);
            return response(true, warehouse);
        });
    }

    function updateWarehouse(id, data){
        if (!window.__MOCK__) {
            return realRequest('PUT', 'warehouses/' + id, data);
        }
        return mockRequest(function(){
            var db = loadDb();
            var warehouse = db.warehouses.filter(function(w){ return w.id === id; })[0];
            if (!warehouse) {
                return response(false, null, { message: 'Склад не найден', code: 'NOT_FOUND' });
            }
            warehouse.name = data.name || warehouse.name;
            warehouse.address = data.address || warehouse.address;
            saveDb(db);
            return response(true, warehouse);
        });
    }

    function deleteWarehouse(id){
        if (!window.__MOCK__) {
            return realRequest('DELETE', 'warehouses/' + id);
        }
        return mockRequest(function(){
            var db = loadDb();
            db.warehouses = db.warehouses.filter(function(w){ return w.id !== id; });
            db.products = db.products.filter(function(p){ return p.warehouseId !== id; });
            saveDb(db);
            return response(true, true);
        });
    }

    function getProducts(companyId, warehouseId){
        if (!window.__MOCK__) {
            return realRequest('GET', 'products');
        }
        return mockRequest(function(){
            var db = loadDb();
            var warehouseIds = db.warehouses.filter(function(w){
                return !companyId || w.companyId === companyId;
            }).map(function(w){ return w.id; });
            var products = db.products.filter(function(p){
                if (warehouseId) {
                    return p.warehouseId === warehouseId;
                }
                return warehouseIds.indexOf(p.warehouseId) !== -1;
            });
            return response(true, products);
        });
    }

    function createProduct(data){
        if (!window.__MOCK__) {
            return realRequest('POST', 'products', data);
        }
        return mockRequest(function(){
            var db = loadDb();
            var warehouse = db.warehouses.filter(function(w){ return w.id === data.warehouseId; })[0];
            if (!warehouse) {
                return response(false, null, { message: 'Склад не найден', code: 'NOT_FOUND' });
            }
            if (!canCreateProduct(db, warehouse.companyId)) {
                return response(false, null, { message: 'Лимит товаров по тарифу исчерпан', code: 'TARIFF_LIMIT' });
            }
            var id = 'p' + db.counters.product++;
            var product = {
                id: id,
                warehouseId: data.warehouseId,
                barcode: data.barcode,
                sku: data.sku,
                name: data.name,
                price: Number(data.price) || 0,
                stock: Number(data.stock) || 0
            };
            db.products.push(product);
            saveDb(db);
            return response(true, product);
        });
    }

    function updateProduct(id, data){
        if (!window.__MOCK__) {
            return realRequest('PUT', 'products/' + id, data);
        }
        return mockRequest(function(){
            var db = loadDb();
            var product = db.products.filter(function(p){ return p.id === id; })[0];
            if (!product) {
                return response(false, null, { message: 'Товар не найден', code: 'NOT_FOUND' });
            }
            product.barcode = data.barcode || product.barcode;
            product.sku = data.sku || product.sku;
            product.name = data.name || product.name;
            product.price = Number(data.price) || product.price;
            product.stock = Number(data.stock) || product.stock;
            product.warehouseId = data.warehouseId || product.warehouseId;
            saveDb(db);
            return response(true, product);
        });
    }

    function deleteProduct(id){
        if (!window.__MOCK__) {
            return realRequest('DELETE', 'products/' + id);
        }
        return mockRequest(function(){
            var db = loadDb();
            db.products = db.products.filter(function(p){ return p.id !== id; });
            saveDb(db);
            return response(true, true);
        });
    }

    function getServices(){
        if (!window.__MOCK__) {
            return realRequest('GET', 'services');
        }
        return mockRequest(function(){
            var db = loadDb();
            return response(true, db.services);
        });
    }

    function createService(data){
        if (!window.__MOCK__) {
            return realRequest('POST', 'services', data);
        }
        return mockRequest(function(){
            var db = loadDb();
            var id = 's' + db.counters.service++;
            var service = { id: id, name: data.name, price: Number(data.price) || 0, durationMin: Number(data.durationMin) || 0 };
            db.services.push(service);
            saveDb(db);
            return response(true, service);
        });
    }

    function updateService(id, data){
        if (!window.__MOCK__) {
            return realRequest('PUT', 'services/' + id, data);
        }
        return mockRequest(function(){
            var db = loadDb();
            var service = db.services.filter(function(s){ return s.id === id; })[0];
            if (!service) {
                return response(false, null, { message: 'Услуга не найдена', code: 'NOT_FOUND' });
            }
            service.name = data.name || service.name;
            service.price = Number(data.price) || service.price;
            service.durationMin = Number(data.durationMin) || service.durationMin;
            saveDb(db);
            return response(true, service);
        });
    }

    function deleteService(id){
        if (!window.__MOCK__) {
            return realRequest('DELETE', 'services/' + id);
        }
        return mockRequest(function(){
            var db = loadDb();
            db.services = db.services.filter(function(s){ return s.id !== id; });
            saveDb(db);
            return response(true, true);
        });
    }

    function createIncome(data){
        if (!window.__MOCK__) {
            return realRequest('POST', 'incomes', data);
        }
        return mockRequest(function(){
            var db = loadDb();
            var id = 'i' + db.counters.income++;
            var income = {
                id: id,
                companyId: data.companyId,
                warehouseId: data.warehouseId,
                date: data.date,
                supplier: data.supplier,
                items: data.items,
                total: data.total
            };
            db.incomes.push(income);
            data.items.forEach(function(item){
                var product = db.products.filter(function(p){ return p.id === item.productId; })[0];
                if (product) {
                    product.stock += Number(item.qty) || 0;
                }
            });
            saveDb(db);
            return response(true, income);
        });
    }

    function getOrders(companyId){
        if (!window.__MOCK__) {
            return realRequest('GET', 'orders');
        }
        return mockRequest(function(){
            var db = loadDb();
            var orders = db.orders.filter(function(o){ return !companyId || o.companyId === companyId; });
            return response(true, orders);
        });
    }

    function getOrder(id){
        if (!window.__MOCK__) {
            return realRequest('GET', 'orders/' + id);
        }
        return mockRequest(function(){
            var db = loadDb();
            var order = db.orders.filter(function(o){ return o.id === id; })[0];
            if (!order) {
                return response(false, null, { message: 'Заказ не найден', code: 'NOT_FOUND' });
            }
            return response(true, order);
        });
    }

    function createOrder(data){
        if (!window.__MOCK__) {
            return realRequest('POST', 'orders', data);
        }
        return mockRequest(function(){
            var db = loadDb();
            var limits = getPlanLimits(db.tariff.plan);
            var currentTurnover = turnoverForMonth(db, data.companyId);
            if (currentTurnover + data.total > limits.turnover) {
                return response(false, null, { message: 'Превышен лимит оборота по тарифу', code: 'TARIFF_LIMIT' });
            }
            var id = 'o' + db.counters.order++;
            var order = {
                id: id,
                companyId: data.companyId,
                warehouseId: data.warehouseId,
                date: data.date,
                items: data.items,
                services: data.services,
                payment: data.payment,
                status: data.status,
                customerName: data.customerName || 'Незнакомый',
                total: data.total
            };
            db.orders.push(order);
            data.items.forEach(function(item){
                var product = db.products.filter(function(p){ return p.id === item.productId; })[0];
                if (product) {
                    product.stock -= Number(item.qty) || 0;
                }
            });
            saveDb(db);
            return response(true, order);
        });
    }

    function updateOrder(id, data){
        if (!window.__MOCK__) {
            return realRequest('PUT', 'orders/' + id, data);
        }
        return mockRequest(function(){
            var db = loadDb();
            var order = db.orders.filter(function(o){ return o.id === id; })[0];
            if (!order) {
                return response(false, null, { message: 'Заказ не найден', code: 'NOT_FOUND' });
            }
            order.status = data.status || order.status;
            order.payment = data.payment || order.payment;
            order.customerName = data.customerName || order.customerName;
            saveDb(db);
            return response(true, order);
        });
    }

    function getDashboard(companyId){
        if (!window.__MOCK__) {
            return realRequest('GET', 'dashboard');
        }
        return mockRequest(function(){
            var db = loadDb();
            var orders = db.orders.filter(function(o){ return !companyId || o.companyId === companyId; });
            var revenue = orders.reduce(function(sum, o){ return sum + (o.total || 0); }, 0);
            var sales = orders.length;
            var stock = db.products.reduce(function(sum, p){ return sum + (p.stock || 0); }, 0);
            var activity = orders.slice(-5).map(function(order){
                return { id: order.id, total: order.total, date: order.date, status: order.status };
            });
            return response(true, { revenue: revenue, sales: sales, stock: stock, activity: activity });
        });
    }

    function getTariff(){
        if (!window.__MOCK__) {
            return realRequest('GET', 'tariff');
        }
        return mockRequest(function(){
            var db = loadDb();
            return response(true, db.tariff);
        });
    }

    function setTariff(plan){
        if (!window.__MOCK__) {
            return realRequest('POST', 'tariff', { plan: plan });
        }
        return mockRequest(function(){
            var db = loadDb();
            db.tariff.plan = plan;
            saveDb(db);
            return response(true, db.tariff);
        });
    }

    return {
        login: login,
        register: register,
        getCompanies: getCompanies,
        createCompany: createCompany,
        updateCompany: updateCompany,
        deleteCompany: deleteCompany,
        getWarehouses: getWarehouses,
        createWarehouse: createWarehouse,
        updateWarehouse: updateWarehouse,
        deleteWarehouse: deleteWarehouse,
        getProducts: getProducts,
        createProduct: createProduct,
        updateProduct: updateProduct,
        deleteProduct: deleteProduct,
        getServices: getServices,
        createService: createService,
        updateService: updateService,
        deleteService: deleteService,
        createIncome: createIncome,
        getOrders: getOrders,
        getOrder: getOrder,
        createOrder: createOrder,
        updateOrder: updateOrder,
        getDashboard: getDashboard,
        getTariff: getTariff,
        setTariff: setTariff
    };
})();
