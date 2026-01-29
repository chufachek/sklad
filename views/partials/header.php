<header class="app-header">
    <div class="header-left">
        <a class="logo" href="/dashboard">Easy <span>склад</span></a>
        <div class="header-selects">
            <div class="custom-select" data-select="company">
                <button class="select-trigger" type="button">Компания</button>
                <div class="select-dropdown"></div>
            </div>
            <div class="custom-select" data-select="warehouse">
                <button class="select-trigger" type="button">Склад</button>
                <div class="select-dropdown"></div>
            </div>
        </div>
    </div>
    <div class="header-actions">
        <button class="btn btn-primary" data-quick="income">+ Приход</button>
        <button class="btn btn-secondary" data-quick="order">+ Заказ</button>
        <button class="btn btn-accent" data-quick="pos">Касса</button>
    </div>
    <div class="header-right">
        <button class="theme-toggle" aria-label="Переключить тему">
            <span class="theme-icon">🌙</span>
        </button>
        <div class="profile-menu">
            <button class="profile-trigger" type="button">Профиль ▾</button>
            <div class="profile-dropdown">
                <a href="/profile">Профиль</a>
                <a href="/profile#tariff">Тариф</a>
                <a href="/logout">Выход</a>
            </div>
        </div>
    </div>
</header>
