<section class="page-header">
    <div>
        <h1>Приход</h1>
        <p class="muted">Увеличение остатков и фиксация закупок.</p>
    </div>
</section>

<section class="card">
    <div class="card-body">
        <form id="incomeForm" class="form grid grid-3">
            <label>
                Склад
                <div class="custom-select" data-select="incomeWarehouse">
                    <button class="select-trigger" type="button">Выбрать склад</button>
                    <div class="select-dropdown"></div>
                </div>
            </label>
            <label>
                Дата
                <input type="date" name="date" required>
            </label>
            <label>
                Поставщик
                <input type="text" name="supplier" placeholder="ООО Поставщик">
            </label>
        </form>
        <div class="income-items">
            <div class="income-toolbar">
                <input id="incomeSearch" type="text" placeholder="Добавить товар по названию или штрихкоду">
                <button class="btn btn-secondary" id="addIncomeRow">Добавить строку</button>
            </div>
            <div id="incomeTable"></div>
            <div class="income-footer">
                <div class="summary-row"><span>Итого</span><strong id="incomeTotal">0 ₽</strong></div>
                <button class="btn btn-accent" id="saveIncome">Сохранить приход</button>
            </div>
        </div>
    </div>
</section>
