$(document).ready(function() {

document.querySelector('.add-comment').onsubmit = function () {
    $.ajax({
        url: '/api/comments/',
        method: 'post',
        datatype: 'json',
        data: $(this).serializeArray(),
        success: function(data){
            var date = data.published.split('T')[0].split('-');
            date = date[2] + '.' + date[1] + '.' + date[0];

            var comments_block = document.querySelector('.comments');

            var comment = document.createElement('div');
            comment.setAttribute('class', 'comment');

            comment.innerHTML = `
            <div class="comment-header">
                <div class="comment-author-avatar">
                    <a href="${data.author_url}">
                        <img src="${data.author_avatar}">
                    </a>
                </div>
                <div class="comment-author-data">
                    <p>
                        <a href="${data.author_url}">
                            ${data.author_fio}
                        </a>
                    </p>
                    <p class="grey-color">${date}</p>
                </div>
            </div>
            <div class="comment-content">
                ${data.text}
            </div>
            `;

            comments_block.prepend(comment);

            var counter = document.querySelector('.comments-count');
            counter.innerHTML = Number(counter.innerHTML) + 1;
        }
    });

    this.reset();

    return false;
}

var form = document.querySelector('#favorite-add');
if (form) {
    form.onsubmit = add;
}

var form = document.querySelector('#favorite-del');
if (form) {
    form.onsubmit = del;
}

});

function add() {
    $.ajax({
        url: '/api/favorites/',
        method: 'post',
        datatype: 'json',
        data: $(this).serializeArray(),
        success: function(data){
            var form = document.querySelector('#favorite-add');
            form.querySelector('input[name="article"]').value = data.id;

            form.setAttribute('id', 'favorite-del');
            form.onsubmit = del;
        }
    });

    return false;
}

function del() {
    $.ajax({
        url: '/api/favorites/'+$(this).serializeArray()[1].value+'/',
        method: 'delete',
        data: $(this).serializeArray(),
        success: function(data){
            var form = document.querySelector('#favorite-del');
            form.querySelector('input[name="article"]').value = document.querySelector('input[name="article-id"]').value;

            form.setAttribute('id', 'favorite-add');
            form.onsubmit = add;
        }
    });

    return false;
}