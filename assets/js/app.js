(function(){
    function setTheme(theme){
        document.documentElement.setAttribute('data-theme', theme);
        State.set('theme', theme);
        var icon = document.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    function initTheme(){
        var stored = State.get('theme', 'light');
        setTheme(stored);
        var toggle = document.querySelector('.theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', function(){
                var current = State.get('theme', 'light');
                setTheme(current === 'dark' ? 'light' : 'dark');
            });
        }
    }

    function initProfileMenu(){
        var menu = document.querySelector('.profile-menu');
        if (!menu) {
            return;
        }
        menu.querySelector('.profile-trigger').addEventListener('click', function(){
            menu.classList.toggle('open');
        });
        document.addEventListener('click', function(e){
            if (!menu.contains(e.target)) {
                menu.classList.remove('open');
            }
        });
    }

    function ensureAuth(){
        var page = document.body.getAttribute('data-page');
        if (page === 'login' || page === 'register') {
            return;
        }
        var token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/login';
        }
    }

    function handleAuthForms(){
        var loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e){
                e.preventDefault();
                var data = {
                    email: loginForm.email.value,
                    password: loginForm.password.value
                };
                API.login(data).then(function(res){
                    if (!res.ok) {
                        Toast.error(res.error.message || 'Ошибка входа');
                        return;
                    }
                    localStorage.setItem('authToken', res.data.token);
                    localStorage.setItem('user', JSON.stringify(res.data.user));
                    document.cookie = 'authToken=' + res.data.token + ';path=/';
                    var lastPage = State.get('lastPage', '/dashboard');
                    window.location.href = lastPage || '/dashboard';
                });
            });
        }
        var registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', function(e){
                e.preventDefault();
                var data = {
                    name: registerForm.name.value,
                    email: registerForm.email.value,
                    password: registerForm.password.value
                };
                API.register(data).then(function(res){
                    if (!res.ok) {
                        Toast.error(res.error.message || 'Ошибка регистрации');
                        return;
                    }
                    localStorage.setItem('authToken', res.data.token);
                    localStorage.setItem('user', JSON.stringify(res.data.user));
                    document.cookie = 'authToken=' + res.data.token + ';path=/';
                    window.location.href = '/dashboard';
                });
            });
        }
    }

    function initSidebarActive(){
        var page = document.body.getAttribute('data-page');
        if (!page) {
            return;
        }
        document.querySelectorAll('.sidebar-nav a').forEach(function(link){
            if (link.getAttribute('data-nav') === page) {
                link.classList.add('active');
            }
        });
    }

    function initQuickActions(){
        document.querySelectorAll('[data-quick]').forEach(function(btn){
            btn.addEventListener('click', function(){
                var target = btn.getAttribute('data-quick');
                if (target === 'income') {
                    window.location.href = '/income';
                }
                if (target === 'order') {
                    window.location.href = '/orders';
                }
                if (target === 'pos') {
                    window.location.href = '/pos';
                }
            });
        });
    }

    function initGlobalSelects(){
        Select.init();
        Select.onChange('company', function(company){
            State.set('activeCompanyId', company.id);
            State.set('activeCompany', company);
            State.set('activeWarehouseId', null);
            State.set('activeWarehouse', null);
            loadWarehouses(company.id);
            Breadcrumbs.render();
            document.dispatchEvent(new Event('contextChanged'));
        });
        Select.onChange('warehouse', function(warehouse){
            State.set('activeWarehouseId', warehouse.id);
            State.set('activeWarehouse', warehouse);
            Breadcrumbs.render();
            document.dispatchEvent(new Event('contextChanged'));
        });
        loadCompanies();
    }

    function loadCompanies(){
        API.getCompanies().then(function(res){
            if (!res.ok) {
                return;
            }
            var companies = res.data;
            if (!companies.length) {
                Select.setOptions('company', [], null, 'Нет компаний');
                return;
            }
            var activeCompanyId = State.get('activeCompanyId', companies[0].id);
            var activeCompany = companies.filter(function(c){ return c.id === activeCompanyId; })[0] || companies[0];
            State.set('activeCompanyId', activeCompany.id);
            State.set('activeCompany', activeCompany);
            Select.setOptions('company', companies, activeCompany.id, 'Компания');
            loadWarehouses(activeCompany.id);
            Breadcrumbs.render();
        });
    }

    function loadWarehouses(companyId){
        API.getWarehouses(companyId).then(function(res){
            if (!res.ok) {
                return;
            }
            var warehouses = res.data;
            if (!warehouses.length) {
                Select.setOptions('warehouse', [], null, 'Нет складов');
                return;
            }
            var activeWarehouseId = State.get('activeWarehouseId', warehouses[0].id);
            var activeWarehouse = warehouses.filter(function(w){ return w.id === activeWarehouseId; })[0] || warehouses[0];
            State.set('activeWarehouseId', activeWarehouse.id);
            State.set('activeWarehouse', activeWarehouse);
            Select.setOptions('warehouse', warehouses, activeWarehouse.id, 'Склад');
            Breadcrumbs.render();
        });
    }

    function initBreadcrumbs(){
        Breadcrumbs.render();
    }

    function saveLastPage(){
        var path = window.location.pathname;
        if (path !== '/login' && path !== '/register') {
            State.set('lastPage', path);
        }
    }

    function initPageModules(){
        var page = document.body.getAttribute('data-page');
        var modules = window.PageModules || {};
        if (modules[page]) {
            modules[page]();
        }
    }

    $(function(){
        ensureAuth();
        initTheme();
        initProfileMenu();
        initSidebarActive();
        initQuickActions();
        handleAuthForms();
        if (document.body.getAttribute('data-page') !== 'login' && document.body.getAttribute('data-page') !== 'register') {
            initGlobalSelects();
            initBreadcrumbs();
        }
        saveLastPage();
        initPageModules();
    });
})();
