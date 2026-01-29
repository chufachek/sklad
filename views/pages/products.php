<section class="page-header">
    <div>
        <h1>Товары</h1>
        <p class="muted">Быстрое добавление и поиск.</p>
    </div>
    <button class="btn btn-accent" id="createProduct">Добавить товар</button>
</section>

<section class="card">
    <div class="card-body">
        <div class="filters">
            <input id="productSearch" type="text" placeholder="Поиск по штрихкоду, артикулу, названию">
            <div class="custom-select" data-select="productWarehouse">
                <button class="select-trigger" type="button">Все склады</button>
                <div class="select-dropdown"></div>
            </div>
        </div>
        <div id="productsTable"></div>
    </div>
</section>
