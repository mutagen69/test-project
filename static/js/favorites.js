$(document).ready(function() {

document.querySelector('input[name="search"]').onkeyup = function (e) {
    if (e.code == 'Enter') {
        clear_articles();

        get_articles({
            category: get_category(),
            q: 20,
            sorted: get_sorted(),
            tags: get_tag(),
            date: get_date(),
            reading_time: get_reading_time(),
            author: get_author(),
            search: this.value,
            favorite: 1
        });
    }
}

$('#more-filters').click(function() {
    document.querySelector('#more-filters').style.display = 'none';
    document.querySelector('.other-filters').style.display = 'block';
});

$('#not-more-filters').click(function() {
    document.querySelector('#more-filters').style.display = 'block';
    document.querySelector('.other-filters').style.display = 'none';
});

$("#open-author-list").click(function() {
    $(this).toggleClass("open");
    if ($(this).hasClass('open')) {
        document.querySelector('#authors-find').style.display = 'flex';
    } else {
        document.querySelector('#authors-find').style.display = 'none';
    }
});

document.querySelector('input[name="author-search"]').onfocus = function () {
    document.querySelector('#authors-find').style.display = 'flex';
    document.querySelector('#open-author-list').classList.add('open');
}

//МАСКА ПОЛЕЙ
var date_inputs = document.querySelectorAll('.date-limits > input');
for (var i=0; i != date_inputs.length; i++) {
    var input = date_inputs[i];
    input.onkeyup = function () {
        var v = this.value;
        if (v.match(/^\d{2}$/) !== null) {
            this.value = v + '.';
        } else if (v.match(/^\d{2}\.\d{2}$/) !== null) {
            this.value = v + '.';
        }

        if (this.value.length == 10 || this.value.length == 0) {
            clear_articles();
            get_articles({
                category: get_category(),
                q: 20,
                sorted: get_sorted(),
                tags: get_tag(),
                date: get_date(),
                reading_time: get_reading_time(),
                author: get_author(),
                favorite: 1
            });
        }
    }
}

//ОСНОВНЫЕ КНОПКИ
var author_search = document.querySelector('input[name="author-search"]');
author_search.onkeyup = function () {
    if (this.value.length >= 3) {
        document.querySelector('#authors-find').style.display = 'flex';
        document.querySelector('#open-author-list').classList.add('open');

        get_authors({
            q: this.value
        });
    }
}

var reading_time_btns = document.querySelectorAll('.reading-limits > button');
for (var i=0; i != reading_time_btns.length; i++) {
    var btn = reading_time_btns[i];
    btn.onclick = function() {
        var other_btns = document.querySelectorAll('.reading-limits > button.active');
        for (var j=0; j != other_btns.length; j++) {
            if (this.value != other_btns[j].value) {
                other_btns[j].classList.remove('active');
            }
        }

        if (this.classList.contains('active')) {
            this.classList.remove('active');
        } else {
            this.classList.add('active');
        }

        clear_articles();

        get_articles({
            category: get_category(),
            q: 20,
            sorted: get_sorted(),
            tags: get_tag(),
            date: get_date(),
            reading_time: get_reading_time(),
            author: get_author(),
            favorite: 1
        });
    }
}

var btn_more_articles = document.querySelector('#articles_more');
btn_more_articles.onclick = function () {
    get_articles({
        q: 20,
        startwith: get_startwith_article(),
        category: get_category(),
        sorted: get_sorted(),
        tags: get_tag(),
        date: get_date(),
        reading_time: get_reading_time(),
        author: get_author(),
        favorite: 1
    });
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
    var url = new URL(document.location.href);
    var start_tag = url.searchParams.get("tags");

    get_tags({
        q: 20,
        startwith: get_startwith_tag(),
        selected: start_tag
    });
}

var set_sorted_btns = document.querySelectorAll('input[name="sorted"]');
for (var i=0; i != set_sorted_btns.length; i++) {
    var btn = set_sorted_btns[i];
    btn.onchange = function () {
        clear_articles();

        get_articles({
            q: 20,
            category: get_category(),
            sorted: get_sorted(),
            tags: get_tag(),
            date: get_date(),
            reading_time: get_reading_time(),
            author: get_author(),
            favorite: 1
        });
    }
}

//СТАРТОВАЯ ПРОГРУЗКА
var url = new URL(document.location.href);
var search = url.searchParams.get("q");

get_articles({
    q: 20,
    search: search,
    favorite: 1
});

document.querySelector('input[name="search"]').value = search;

var url = new URL(document.location.href);
var start_category = url.searchParams.get("category");

get_categories({
    q: 10,
    selected: start_category
});

setTimeout( function () {
    var categories = document.querySelectorAll('.set_category > div:nth-child(1)');
    for (var i = 0; i != categories.length; i++) {
        var category = categories[i];
        if (category.innerHTML.indexOf(start_category) >= 0) {
            category.click();
            break;
        }
    }
}, 1000);

var url = new URL(document.location.href);
var start_tag = url.searchParams.get("tags");

get_tags({
    q: 20,
    selected: start_tag
});

setTimeout( function () {
    var tags = document.querySelectorAll('.tag');
    for (var i = 0; i != tags.length; i++) {
        var tag = tags[i];
        if (tag.innerHTML.indexOf(start_tag) >= 0) {
            tag.click();
            break;
        }
    }
}, 1000);

})

//ГЕНЕРАЦИЯ HTML
function generate_author(author) {
    var author_html = `
        <button value="${author.id}" class="apply-author">${author.fio}</button>
    `;
    return author_html;
}

function generate_tag(tag) {
    var tag_html = `
	<div class="tag">
        ${tag.title}
    </div>
	`;
	return tag_html;
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
	category_html += `</li></div>`;
	return category_html;
}

function generate_article(article) {
    var author_fio = article.author_first_name.substr(0, 1) + '. ' + article.author_last_name;
	var published = article.published.split('T')[0].split('-');
	var date = published[2] + '.' + published[1] + '.' + published[0];

	var tags = ``;
	for (var j=0; j != article.tags.length; j++) {
	    var tag = article.tags[j];
	    tags += `
	    <a href="/articles/?tags=${tag}">
            <div class="tag-not-click">
                ${tag}
            </div>
        </a>
	    `;
	}

	var article_html = `
    <div class="article">
        <div>
            <p class="author-info">
                <a href="${article.author_url}">
                    <img class="mini-avatar" src="${article.author_avatar_url}">
                    ${author_fio}
                </a>
                <span class="grey-text"> в категории </span> <span class="set_category_from_article">${article.category_title}</span>
            </p>
        </div>
        <div>
            <div>
                <h2><a href="${article.article_url}">${article.title}</a></h2>
                <h3><a href="${article.article_url}">${article.short_content}</a></h3>
                <p>
                    <span class="grey-text">
                        ${date}        ${article.reading_time} мин. для прочтения
                    </span>
                </p>
            </div>
            <div>
                <a href="${article.article_url}">
                    <img src="${article.image_url}">
                </a>
            </div>
        </div>
        <div>

            ${tags}

        </div>
    </div>
	`;
	return article_html;
}

function clear_articles() {
    document.querySelector('.articles-block > div:nth-child(1)').innerHTML = `
    <div class="articles-more">
        <button id="articles_more">
            Показать больше
        </button>
    </div>
    <div class="error">
        <span class="red-color">Не найдено ни одной статьи. Попробуйте изменить параметры фильтрации</span>
    </div>
    `;
    var btn_more_articles = document.querySelector('#articles_more');
    btn_more_articles.onclick = function () {
        get_articles({
            q: 20,
            startwith: get_startwith_article(),
            category: get_category(),
            sorted: get_sorted(),
            tags: get_tag(),
            date: get_date(),
            reading_time: get_reading_time(),
            author: get_author(),
            favorite: 1
        });
    }
}

//КНОПКИ
function set_category_from_article() {
    var category = this.innerHTML;
    var categories = document.querySelectorAll('.set_category');
    for (var j=0; j != categories.length; j++) {
        var category_btn = categories[j];
        var category_text = category_btn.querySelector('div');
        if (category == category_text.innerHTML) {
            category_text.click();
        }
    }
}

//СБОР ДАННЫХ
function get_author() {
    var author = document.querySelectorAll('.apply-author.active');

    if (author.length > 0) {
        author = author[0].value;
    } else {
        author = 0
    }

    return author;
}

function get_reading_time() {
    var reading_time = document.querySelectorAll('.reading-limits > button.active');
    if (reading_time.length == 0) {
        reading_time = 0;
    } else {
        reading_time = reading_time[0].value;
    }
    return reading_time;
}

function get_date() {
    var start_date = document.querySelector('input[name="date-start"]').value;
    var end_date = document.querySelector('input[name="date-end"]').value;

    if (start_date.length != 10) {
        start_date = '01.02.0001';
    }
    if (end_date.length != 10) {
        end_date = '31.12.9999';
    }

    return start_date + '-' + end_date;
}

function get_sorted() {
    return document.querySelector('input[name="sorted"]:checked').value;
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

function get_category() {
    var category = document.querySelectorAll('.set_category.active');
    if (category.length > 0) {
        var category = category[0].querySelector('div').innerHTML;
    } else {
        var category = '';
    }
    return category;
}

function get_startwith_category() {
    var startwith = document.getElementsByClassName('parent_category');
    return startwith.length;
}

function get_startwith_article() {
    var startwith = document.getElementsByClassName('article');
    return startwith.length;
}

function get_startwith_tag() {
    var startwith = document.getElementsByClassName('tag');
    return startwith.length;
}

//AJAX
function get_articles(request_data) {
    $.ajax({
        url: '/api/articles',
        method: 'get',
        datatype: 'json',
        data: request_data,
        success: function(data){
	        if (data.length == 0) {
	            document.querySelector('#articles_more').style.display = 'none';
	            document.querySelector('.articles-more > span.red-color').style.display = 'block';
	        } else {
	            document.querySelector('.red-color').style.display = 'none';
	        }

	        var articles_block = $('.articles-block > div:nth-child(1) > div.articles-more');

	        for (var i=0; i != data.length; i++) {
	            var article = data[i];

	            articles_block.before(generate_article(article));

	            if (article.last_objects == true) {
	                document.querySelector('#articles_more').style.display = 'none';
	            } else {
	                document.querySelector('#articles_more').style.display = 'flex';
	            }
	        }

	        var set_category_from_article_btns = document.getElementsByClassName('set_category_from_article');
	        for (var i=0; i != set_category_from_article_btns.length; i++) {
	            var btn = set_category_from_article_btns[i];
	            btn.onclick = set_category_from_article;
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
	        var categories_block = $('.articles-block > div:nth-child(2) > ul > div.categories-more');
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

                    clear_articles();

                    get_articles({
                        category: get_category(),
                        q: 20,
                        sorted: get_sorted(),
                        tags: get_tag(),
                        date: get_date(),
                        reading_time: get_reading_time(),
                        author: get_author(),
                        favorite: 1
                    });
                }
            }

            var open_list_btns = document.getElementsByClassName('open-list');
            for (var i=0; i != open_list_btns.length; i++){
                var btn = open_list_btns[i];

                btn.onclick = function() {
                    var ul = this.parentNode.getElementsByClassName('subcategories')[0];
                    if (ul.style.display == 'block') {
                        ul.style.display = 'none';
                        this.innerHTML = '+';
                    } else {
                        ul.style.display = 'block';
                        this.innerHTML = '-';
                    }
                }
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
	        var tags_block = $('.articles-block > div:nth-child(2) > div.tags > div.tags-more');
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

                    clear_articles();

                    get_articles({
                        category: get_category(),
                        q: 20,
                        sorted: get_sorted(),
                        tags: get_tag(),
                        date: get_date(),
                        reading_time: get_reading_time(),
                        author: get_author(),
                        favorite: 1
                    });
                }
            }
            return true;
	    }
    });
}

function get_authors(request_data) {
    $.ajax({
        url: '/api/authors',
        method: 'get',
        datatype: 'json',
        data: request_data,
        success: function(data){
	        var authors_block = $('#authors-find');

            var values = [];
	        var btns = document.querySelectorAll('.apply-author');
	        for (var j=0; j != btns.length; j++) {
	            var btn = btns[j];
	            if (btn.hasAttribute('disabled')) {
	                continue;
	            }
	            values.push(Number(btn.value));
	        }

            var new_values = [0];
	        for (var i=0; i != data.length; i++) {
	            var author = data[i];

	            new_values.push(Number(author.id));

	            if (values.indexOf( author.id ) == -1) {
	                var btn = $(generate_author(author));
	                authors_block.append(btn);
	            }
	        }

	        var btns = document.querySelectorAll('.apply-author');
	        for (var j=0; j != btns.length; j++) {
	            var btn = btns[j];

	            if (new_values.indexOf( Number(btn.value) ) == -1) {
	                btn.parentNode.removeChild(btn);
	            }
	        }

	        if (data.length == 0) {
	            var btns = document.querySelectorAll('.apply-author');
	            for (var i=0; i != btns.length; i++) {
	                var btn = btns[i];
	                btn.parentNode.removeChild(btn);
	            }

                var disable_option = $('<button class="apply-author not-find" value="0" disabled="disabled">Авторы не найдены</button>');
                authors_block.append(disable_option);
            } else {
                if (values.indexOf( 0 ) == -1) {
                    var default_option = $('<button class="apply-author" value="0">Не выбрано</button>');
                    authors_block.append(default_option);
                }

                var btn = document.querySelectorAll('.not-find');
                if (btn.length > 0) {
                    btn[0].parentNode.removeChild(btn[0]);
                }
            }

            var btns = document.querySelectorAll('.apply-author');
            for (var i=0; i != btns.length; i++) {
                var btn = btns[i];
                btn.onclick = function () {
                    var other_buttons = document.querySelectorAll('.apply-author.active');
                    for (var j=0; j != other_buttons.length; j++) {
                        if (this.innerHTML != other_buttons[j].innerHTML) {
                            other_buttons[j].classList.remove('active');
                        }
                    }

                    if (this.classList.contains('active')) {
                        this.classList.remove('active');
                    } else {
                        this.classList.add('active');
                    }

                    clear_articles();

                    get_articles({
                        category: get_category(),
                        q: 20,
                        sorted: get_sorted(),
                        tags: get_tag(),
                        date: get_date(),
                        reading_time: get_reading_time(),
                        author: get_author(),
                        favorite: 1
                    });
                }
            }
	    }
    });
}
