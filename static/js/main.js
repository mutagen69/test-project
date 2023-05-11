$(document).ready(function() {

var btn_more_articles = document.querySelector('#articles_more');
btn_more_articles.onclick = function () {
    get_articles({
        q: 5,
        startwith: get_startwith_article(),
        category: get_category()
    });
}

var btn_more_categories = document.querySelector('#categories_more');
btn_more_categories.onclick = function () {
    get_categories({
        q: 10,
        startwith: get_startwith_category()
    });
}

get_articles({
    q: 5
});

get_categories({
    q: 10
});

})

//ГЕНЕРАЦИЯ HTML
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

function get_startwith_category() {
    var startwith = document.getElementsByClassName('parent_category');
    return startwith.length;
}

function get_startwith_article() {
    var startwith = document.getElementsByClassName('article');
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
	        var articles_block = $('.articles-block > div:nth-child(1) > div.articles-more');
	        if (data.length == 0) {
	            document.querySelector('#articles_more').style.display = 'none';
	        }
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

                    var articles_block = document.querySelector('div.articles-block > div:nth-child(1)');
                    articles_block.innerHTML = `
                    <div class="articles-more">
                        <button id="articles_more">
                            Показать больше
                        </button>
                    </div>
                    `;

                    var btn_more_articles = document.querySelector('#articles_more');

                    btn_more_articles.onclick = function () {
                        get_articles({
                            q: 5,
                            startwith: get_startwith_article(),
                            category: get_category()
                        });
                    }

                    get_articles({
                        category: get_category(),
                        q: 5
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