$(document).ready(function() {

var btn_more_articles = document.querySelector('#articles_more');
btn_more_articles.onclick = function () {
    get_articles({
        q: 5,
        startwith: get_startwith_article(),
        category: get_category(),
        author: get_author()
    });
}

get_articles({
    q: 5,
    author: get_author()
});

})

//ГЕНЕРАЦИЯ HTML

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
            <p class="author-info-m">
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

//ФУНКЦИИ ПОЛУЧЕНИЯ ДАННЫХ С ФОРМЫ
function get_author() {
    var data = window.location.href.split('/');
    return data[data.length-2]
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
	    }
    });
}