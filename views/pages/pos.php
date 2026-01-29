<section class="page-header">
    <div>
        <h1>Касса</h1>
        <p class="muted">Быстрый POS — минимум кликов.</p>
    </div>
    <div class="pos-shortcuts">Горячие клавиши: / поиск • Enter добавить • Ctrl+Enter оплатить</div>
</section>

<div class="pos-layout">
    <div class="card pos-search">
        <div class="card-header">
            <h2>Поиск товаров и услуг</h2>
        </div>
        <div class="card-body">
            <input id="posSearch" type="text" placeholder="Штрихкод, артикул, название" autocomplete="off">
            <div id="posResults" class="list"></div>
        </div>
    </div>

    <div class="card pos-receipt">
        <div class="card-header">
            <h2>Чек</h2>
        </div>
        <div class="card-body">
            <div id="posReceiptItems" class="list"></div>
            <div class="pos-summary">
                <div class="summary-row"><span>Сумма</span><strong id="posSum">0 ₽</strong></div>
                <div class="summary-row"><span>Скидка</span><span id="posDiscount">0 ₽</span></div>
                <div class="summary-row total"><span>К оплате</span><strong id="posTotal">0 ₽</strong></div>
                <div class="payment-toggle" id="posPayment"></div>
            </div>
            <div class="pos-actions">
                <button class="btn btn-accent" id="posPay">Оплатить</button>
                <button class="btn btn-secondary" id="posSave">Сохранить</button>
                <button class="btn btn-light" id="posClear">Очистить</button>
            </div>
        </div>
    </div>
</div>
