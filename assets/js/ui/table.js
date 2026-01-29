window.Table = (function(){
    function render(container, columns, rows, emptyText){
        if (!container) {
            return;
        }
        if (!rows.length) {
            container.innerHTML = '<div class="list-empty">' + (emptyText || 'Данных нет') + '</div>';
            return;
        }
        var thead = '<thead><tr>' + columns.map(function(col){ return '<th>' + col.label + '</th>'; }).join('') + '</tr></thead>';
        var tbody = '<tbody>' + rows.map(function(row){
            return '<tr>' + columns.map(function(col){
                return '<td>' + (col.render ? col.render(row) : row[col.key]) + '</td>';
            }).join('') + '</tr>';
        }).join('') + '</tbody>';
        container.innerHTML = '<table class="table">' + thead + tbody + '</table>';
    }

    function skeleton(container, rows){
        var html = '<table class="table">';
        for (var i = 0; i < rows; i++) {
            html += '<tr>';
            html += '<td><div class="skeleton"></div></td>'.repeat(5);
            html += '</tr>';
        }
        html += '</table>';
        container.innerHTML = html;
    }

    return {
        render: render,
        skeleton: skeleton
    };
})();
