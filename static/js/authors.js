$(document).ready(function() {

document.querySelector('#become-author').onsubmit = function () {
    var data = $(this).serializeArray();
    var errors = this.querySelectorAll('div > .error');
    var error = false;

    if (data[0].value.length == 0) {
        errors[0].style.display = 'block';
        error = true;
    } else {
        errors[0].style.display = 'none';
    }

    if (data[1].value.length == 0) {
        errors[1].style.display = 'block';
        error = true;
    } else {
        errors[1].style.display = 'none';
    }

    if (error) {
        return false;
    }

    $.ajax({
        url: '/api/become_author/',
        method: 'post',
        datatype: 'json',
        data: data,
        success: function(data){
            var errors = document.querySelectorAll('#become-author > div > .error');
			errors[2].style.display = 'none';

			var sb = document.querySelector('#snack-bar')
			sb.style.display = 'block';
			sb.querySelector('span').innerHTML = 'Заявка отправлена на рассмотрение';

			setTimeout( function () {
                var sb = document.querySelector('#snack-bar')
			    sb.style.display = 'none';
            }, 5000);
        },
        error: function (jqXHR, exception) {
            if (jqXHR.status === 400) {
                var data = jqXHR.responseJSON;

                if (data.error == 'Email введен с ошибкой') {
    			    var errors = document.querySelectorAll('#become-author > div > .error');
	    		    errors[2].style.display = 'block';
	    		    return false;
	    		}

	    		var sb = document.querySelector('#snack-bar')
                    sb.style.display = 'block';
                    sb.querySelector('span').innerHTML = 'Заявка уже на рассмотрении';

                    setTimeout( function () {
                        var sb = document.querySelector('#snack-bar')
                        sb.style.display = 'none';
                }, 5000);
		    }
        }
    });

    return false;
}

document.querySelector('input[name="search"]').onkeyup = function (e) {
    if (e.code == 'Enter') {
        clear_authors();

        get_authors({
            category: get_category(),
            quantity: 20,
            tags: get_tag(),
            q: this.value
        });
    }
}

var btn_more_categories = document.querySelector('#categories_more');
btn_more_categories.onclick = function () {
    get_categories({
        q: 10,
        startwith: get_startwith_category()
    });
}

var btn_more_tags = document.querySelector('#tags_more');
btn_more_tags.onclick = function () {

    get_tags({
        q: 20,
        startwith: get_startwith_tag()
    });
}

var btn_more_authors = document.querySelector('#authors_more');
btn_more_authors.onclick = function () {
    get_authors({
        quantity: 20,
        startwith: get_startwith_authors(),
        category: get_category(),
        tags: get_tag()
    });
}

get_categories({
    q: 10
});

get_tags({
    q: 20
});

get_authors({
    quantity: 20,
    startwith: get_startwith_authors(),
    category: get_category(),
    tags: get_tag()
});

})

//ГЕНЕРАЦИЯ HTML
function generate_author(author) {
    var categories = ``;
	for (var j=0; j != author.categories.length; j++) {
	    var category = author.categories[j];
	    categories += `
	    <a class="category" href="/articles/?category=${author.categories[j]}">
             ${author.categories[j]}
        </a>
	    `;
	}

	var author_html = `
    <div class="author-block">

        <div class="author-avatar">
            <a href="${author.url}">
                <img src="${author.avatar}">
            </a>
        </div>

        <div class="author-info">

            <a href="${author.url}">
                <h2>${author.fio}</h2>
            </a>

            <div class="author-categories">
                <p>
                    Категории публикации статей:<br>
                    ${categories}
                </p>
            </div>

            <div class="author-views">
                <p class="grey-color">${author.views} просмотров</p>
            </div>

        </div>

    </div>
	`;
	return author_html;
}

function generate_category(category) {
    var category_html = `<div>`;
	if (category.kids.length > 0) {
	    category_html += `
	        <div class="open-list">+</div>
	    `;
	}
	category_html += `
	    <li class="set_category parent_category">
            <div>${category.title}</div>
	`;
	if (category.kids.length > 0) {
	    category_html += `
	        <ul class="subcategories">
	    `;
	    for (var j=0; j != category.kids.length; j++) {
	        category_html += `
	            <li class="set_category">
                    <div>${category.kids[j]}</div>
                </li>
	        `;
	    }
	    category_html += `</ul>`;
	}
	category_html += `</li></div>
	`;
	return category_html;
}

function generate_tag(tag) {
    var tag_html = `
	<div class="tag">
        ${tag.title}
    </div>
	`;
	return tag_html;
}

//ФУНКЦИИ КНОПОК
function open_list() {
    var ul = this.parentNode.getElementsByClassName('subcategories')[0];

    if (ul.style.display == 'block') {
        ul.style.display = 'none';
        this.innerHTML = '+';
    } else {
        ul.style.display = 'block';
        this.innerHTML = '-';
    }
}

//ФУНКЦИИ ПОЛУЧЕНИЯ ДАННЫХ С ФОРМЫ
function get_category() {
    var category = document.querySelectorAll('.set_category.active');
    if (category.length > 0) {
        var category = category[0].querySelector('div').innerHTML;
    } else {
        var category = '';
    }
    return category;
}

function get_tag() {
    var tags = document.querySelectorAll('.tag.active');
    var tags_text = '';
    for (var j=0; j != tags.length; j++) {
        var tag = tags[j];
        tags_text += tag.innerText + ';';
    }
    return tags_text;
}

function get_startwith_category() {
    var startwith = document.getElementsByClassName('parent_category');
    return startwith.length;
}

function get_startwith_tag() {
    var startwith = document.getElementsByClassName('tag');
    return startwith.length;
}

function get_startwith_authors() {
    var startwith = document.getElementsByClassName('author-block');
    return startwith.length;
}

function clear_authors() {
    document.querySelector('.authors-block').innerHTML = `
    <div class="authors-more">
        <button id="authors_more">
            Показать больше
        </button>

        <div class="error">
            <span class="red-color">Не найдено ни одного автора. Попробуйте изменить параметры фильтрации</span>
        </div>
    </div>
    `;
    var btn_more_articles = document.querySelector('#authors_more');
    btn_more_articles.onclick = function () {
        get_articles({
            quantity: 20,
            startwith: get_startwith_authors(),
            category: get_category(),
            tags: get_tag(),
        });
    }
}

//AJAX
function get_authors(request_data) {
    $.ajax({
        url: '/api/authors',
        method: 'get',
        datatype: 'json',
        data: request_data,
        success: function(data){
	        if (data.length == 0) {
	            document.querySelector('#authors_more').style.display = 'none';
	            document.querySelector('.authors-more > .error > span.red-color').style.display = 'block';
	        } else {
	            document.querySelector('.red-color').style.display = 'none';
	        }

	        var authors_block = $('.authors-block > div.authors-more');

	        for (var i=0; i != data.length; i++) {
	            var author = data[i];

	            authors_block.before(generate_author(author));

	            if (author.last_objects == true) {
	                document.querySelector('#authors_more').style.display = 'none';
	            } else {
	                document.querySelector('#authors_more').style.display = 'block';
	            }
	        }
	    }
    });
}

function get_categories(request_data) {
    $.ajax({
        url: '/api/categories',
        method: 'get',
        datatype: 'json',
        data: request_data,
        success: function(data){
	        var categories_block = $('.content-block > div:nth-child(2) > ul > div.categories-more');
	        for (var i=0; i != data.length; i++) {
	            var category = data[i];

	            categories_block.before(generate_category(category));

	            if (category.last_objects == true) {
	                document.querySelector('#categories_more').style.display = 'none';
	            } else {
	                document.querySelector('#categories_more').style.display = 'flex';
	            }

	        }

	        var set_category_btns = document.getElementsByClassName('set_category');
            for (var i=0; i != set_category_btns.length; i++){
                var btn = set_category_btns[i].querySelector('div');

                btn.onclick = function () {
                    var li = this.parentNode;

                    var other_li_actives = document.querySelectorAll('.set_category.active');
                    for (var j=0; j != other_li_actives.length; j++) {
                        if (li.innerHTML != other_li_actives[j].innerHTML) {
                            other_li_actives[j].classList.remove('active');
                        }
                    }

                    if (li.classList.contains('active')) {
                        li.classList.remove('active');
                    } else {
                        li.classList.add('active');
                    }

                    var authors_block = document.querySelector('div.authors-block');
                    authors_block.innerHTML = `
                    <div class="authors-more">
                        <button id="authors_more">
                            Показать больше
                        </button>

                        <div class="error">
                            <span class="red-color">Не найдено ни одной статьи. Попробуйте изменить параметры фильтрации</span>
                        </div>
                    </div>
                    `;

                    var btn_more_authors = document.querySelector('#authors_more');

                    btn_more_authors.onclick = function () {
                        get_authors({
                            quantity: 20,
                            startwith: get_startwith_authors(),
                            category: get_category(),
                            tags: get_tag()
                        });
                    }

                    get_authors({
                        quantity: 20,
                        startwith: get_startwith_authors(),
                        category: get_category(),
                        tags: get_tag()
                    });
                }
            }

            var open_list_btns = document.getElementsByClassName('open-list');
            for (var i=0; i != open_list_btns.length; i++){
                var btn = open_list_btns[i];
                btn.onclick = open_list;
            }
	    }
    });
}

function get_tags(request_data) {
    $.ajax({
        url: '/api/tags',
        method: 'get',
        datatype: 'json',
        data: request_data,
        success: function(data){
	        var tags_block = $('.content-block > div:nth-child(2) > div.tags > div.tags-more');
	        for (var i=0; i != data.length; i++) {
	            var tag = data[i];

	            tags_block.before(generate_tag(tag));

	            if (tag.last_objects == true) {
	                document.querySelector('#tags_more').style.display = 'none';
	            } else {
	                document.querySelector('#tags_more').style.display = 'block';
	            }

	        }

	        var tags_btns = document.querySelectorAll('.tag');
            for (var i=0; i != tags_btns.length; i++){
                var btn = tags_btns[i];

                btn.onclick = function () {
                    if (this.classList.contains('active')) {
                        this.classList.remove('active');
                    } else {
                        this.classList.add('active');
                    }

                    clear_authors();

                    get_authors({
                        quantity: 20,
                        startwith: get_startwith_authors(),
                        category: get_category(),
                        tags: get_tag()
                    });
                }
            }
            return true;
	    }
    });
}