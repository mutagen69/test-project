$(document).ready(function() {

if (document.querySelector('#open-sidebar') != null) {
    document.querySelector('#open-sidebar').onclick = function () {
        var sb = document.querySelector('.sidebar');
        if (sb.style.display != 'block') {
            document.querySelector('.sidebar').style.display = 'block';
        } else {
            document.querySelector('.sidebar').style.display = 'none';
        }
    }
}

if (document.querySelector('#close-sidebar') != null) {
    document.querySelector('#close-sidebar').onclick = function () {
        document.querySelector('.sidebar').style.display = 'none';
    }
}

if (document.querySelector('#open-popup-sign') != null) {
    document.querySelector('#open-popup-sign').onclick = function () {
        document.querySelector('.popup-bg').style.display = 'block';
    }
}

if (document.querySelector('#close-popup-sign') != null) {
    document.querySelector('#close-popup-sign').onclick = function () {
        document.querySelector('.popup-bg').style.display = 'none';
    }
}

if (document.querySelector('#close-email-popup-sign') != null) {
    document.querySelector('#close-email-popup-sign').onclick = function () {
        document.querySelector('#email-popup').style.display = 'none';
    }
}

var btns = document.querySelectorAll('.popup-header > .popup-btn');
for (var i=0; i!=btns.length; i++) {
    var btn = btns[i];
    btn.onclick = function () {
        if (!this.classList.contains('active')) {
            var other_btn = document.querySelector('.popup-header > .popup-btn.active');
            other_btn.classList.remove('active');
            this.classList.add('active');
            if (this.getAttribute('id') == 'reg') {
                document.querySelector('#auth-form').style.display = 'none';
                document.querySelector('#reg-form').style.display = 'flex';
            } else {
                document.querySelector('#auth-form').style.display = 'flex';
                document.querySelector('#reg-form').style.display = 'none';
            }
        }
    }
}

if (document.querySelector('#auth-form') != null) {
document.querySelector('#auth-form').onsubmit = function() {
    $.ajax({
        url: '/api/auth/login/',
        method: 'post',
        datatype: 'json',
        data: $(this).serializeArray(),
        success: function(data){
            window.location.reload();
	    },
	    error: function (jqXHR, exception) {
            if (jqXHR.status === 400) {
                var data = jqXHR.responseJSON;

                if (data.error == 'Email or password error') {
    			    document.querySelector('#auth-form > p.error').style.display = 'block';
	    		}
		    }
        }
    });

    return false;
}
}

if (document.querySelector('#reg-form') != null) {
document.querySelector('#reg-form').onsubmit = function() {
    $.ajax({
        url: '/api/auth/registration/',
        method: 'post',
        datatype: 'json',
        data: $(this).serializeArray(),
        success: function(data){
            document.querySelector('#close-popup-sign').click();
            document.querySelector('#email-popup').style.display = 'block';
            var email = document.querySelector('#reg-form > input[name="email"]').value;
            document.querySelector('#email-confirm').innerHTML = email;
	    },
	    error: function (jqXHR, exception) {
            if (jqXHR.status === 400) {
                var data = JSON.parse(jqXHR.responseJSON);

                var errors = document.querySelectorAll('#reg-form > p.error');
                for (var i=0; i!=errors.length; i++) {
                    var error = errors[i];
                    error.parentNode.removeChild(error);
                }

                for (var [field, messages] of Object.entries(data)) {
                    field = document.querySelector('#reg-form > input[name="'+field+'"]');
                    for (var i=0; i!= messages.length; i++) {
                        var p = document.createElement('p');
                        p.classList.add('error');
                        p.innerHTML = messages[i].message;
                        p.style.display = 'block';
                        field.after(p);
                    }
                }
		    }
        }
    });

    return false;
}
}

var field = 'register';
var url = window.location.href;
if(url.indexOf('?' + field + '=') != -1){
    var sb = document.querySelector('#snack-bar')
	sb.style.display = 'block';
	sb.querySelector('span').innerHTML = 'Регистрация прошла успешно!!!11!';
	setTimeout( function () {
        var sb = document.querySelector('#snack-bar')
	    sb.style.display = 'none';
    }, 5000);
}

(function() {
    if(url.indexOf('?article=') != -1){
        var status = url.split('?article=')[url.split('?article=').length-1];
        if (status == 'edit') {
            var text = 'Статья успешно изменена';
        } else if (status == 'create') {
            var text = 'Статья опубликована!';
        } else if (status == 'need') {
            var text = 'Чтобы опубликовывать статьи нужно стать автором';
        } else if (status == 'delete') {
            var text = 'Статья удалена!';
        } else {
            return 0;
        }

        var sb = document.querySelector('#snack-bar')
        sb.style.display = 'block';
        sb.querySelector('span').innerHTML = text;
        setTimeout( function () {
            var sb = document.querySelector('#snack-bar')
            sb.style.display = 'none';
        }, 5000);
    }
})();

if(url.split('/').length > 4 && url.indexOf('-') != -1){
    if (document.querySelector('#password-reset-popup') != null) {
        document.querySelector('#password-reset-popup').style.display = 'block';
    }
}

if (document.querySelector('#reset-password') != null) {
document.querySelector('#reset-password').onclick = function () {
    document.querySelector('#close-popup-sign').click();
    document.querySelector('#check-email-popup').style.display = 'block';
}
}

if (document.querySelector('#close-check-email-popup') != null) {
document.querySelector('#close-check-email-popup').onclick = function () {
    document.querySelector('#check-email-popup').style.display = 'none';
}
}

if (document.querySelector('#check-email') != null){
document.querySelector('#check-email').onsubmit = function() {
    $.ajax({
        url: '/api/auth/check-email/',
        method: 'post',
        datatype: 'json',
        data: $(this).serializeArray(),
        success: function(data){
            document.querySelector('#close-check-email-popup').click();
            document.querySelector('.popup-bg').style.display = 'block';

            var sb = document.querySelector('#snack-bar')
            sb.style.display = 'block';
            sb.querySelector('span').innerHTML = 'Письмо отправлено';
            setTimeout( function () {
                var sb = document.querySelector('#snack-bar')
                sb.style.display = 'none';
            }, 5000);
	    },
	    error: function (jqXHR, exception) {
            if (jqXHR.status === 400) {
                var data = jqXHR.responseJSON;

                var errors = document.querySelectorAll('#check-email > p.error');
                for (var i=0; i!=errors.length; i++) {
                    var error = errors[i];
                    error.parentNode.removeChild(error);
                }

                for (var [field, messages] of Object.entries(data)) {
                    field = document.querySelector('#check-email > input[name="'+field+'"]');
                    console.log(field);
                    for (var i=0; i!= messages.length; i++) {
                        console.log(messages[i].message);
                        var p = document.createElement('p');
                        p.classList.add('error');
                        p.innerHTML = messages[i].message;
                        p.style.display = 'block';
                        field.after(p);
                    }
                }
		    }
        }
    });

    return false;
}
}

if (document.querySelector('#close-password-reset-popup') != null) {
document.querySelector('#close-password-reset-popup').onclick = function () {
    document.querySelector('#password-reset-popup').style.display = 'none';
}
}

if (document.querySelector('#password-reset') != null){
document.querySelector('#password-reset').onsubmit = function() {
    $.ajax({
        url: '/api/auth/password-validate/',
        method: 'post',
        datatype: 'json',
        data: $(this).serializeArray(),
        success: function(data){
            document.querySelector('#close-password-reset-popup').click();
            document.querySelector('.popup-bg').style.display = 'block';

            var sb = document.querySelector('#snack-bar')
            sb.style.display = 'block';
            sb.querySelector('span').innerHTML = 'Пароль сменён!';
            setTimeout( function () {
                var sb = document.querySelector('#snack-bar')
                sb.style.display = 'none';
            }, 5000);
	    },
	    error: function (jqXHR, exception) {
            if (jqXHR.status === 400) {
                var data = JSON.parse(jqXHR.responseJSON);

                var errors = document.querySelectorAll('#password-reset > p.error');
                for (var i=0; i!=errors.length; i++) {
                    var error = errors[i];
                    error.parentNode.removeChild(error);
                }

                for (var [field, messages] of Object.entries(data)) {
                    field = document.querySelector('#password-reset > input[name="'+field+'"]');
                    for (var i=0; i!= messages.length; i++) {
                        var p = document.createElement('p');
                        p.classList.add('error');
                        p.innerHTML = messages[i].message;
                        p.style.display = 'block';
                        field.after(p);
                    }
                }
		    }
        }
    });

    return false;
}
}

if (document.querySelector('#author-request') != null) {
    document.querySelector('#author-request').onclick = function () {
        document.querySelector('#author-request-tool-type').style.display = 'block';
    }

    document.querySelector('#close-tool-type').onclick = function () {
        document.querySelector('#author-request-tool-type').style.display = 'none';
    }

    document.querySelector('#become-author-sidebar').onsubmit = function () {
        document.querySelector('#author-request-tool-type').style.display = 'none';
        var data = $(this).serializeArray();

        $.ajax({
            url: '/api/become_author/',
            method: 'post',
            datatype: 'json',
            data: data,
            success: function(data){
                var sb = document.querySelector('#snack-bar');
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
}

if (document.querySelector('#set-password-popup') != null) {
    document.querySelector('#open-set-password').onclick = function () {
        document.querySelector('#set-password-popup').style.display = 'block';
    }

    document.querySelector('#close-set-password-popup').onclick = function () {
       document.querySelector('#set-password-popup').style.display = 'none';
    }

    document.querySelector('#set-password').onsubmit = function () {
        var data = $(this).serializeArray();

        $.ajax({
            url: '/api/auth/set-password/',
            method: 'post',
            datatype: 'json',
            data: data,
            success: function(data){
                document.querySelector('#set-password-popup').style.display = 'none';

                var sb = document.querySelector('#snack-bar');
                sb.style.display = 'block';
                sb.querySelector('span').innerHTML = 'Пароль изменён!';

                setTimeout( function () {
                    var sb = document.querySelector('#snack-bar')
                    sb.style.display = 'none';
                }, 5000);
            },
            error: function (jqXHR, exception) {
                if (jqXHR.status === 400) {
                    var data = JSON.parse(jqXHR.responseJSON);

                    var errors = document.querySelectorAll('#set-password > p.error');
                    for (var i=0; i!=errors.length; i++) {
                        var error = errors[i];
                        error.parentNode.removeChild(error);
                    }

                    for (var [field, messages] of Object.entries(data)) {
                        field = document.querySelector('#set-password > input[name="'+field+'"]');
                        for (var i=0; i!= messages.length; i++) {
                            var p = document.createElement('p');
                            p.classList.add('error');
                            p.innerHTML = messages[i].message;
                            p.style.display = 'block';
                            field.after(p);
                        }
                    }
                }
            }
        });

        return false;
    }
}

});
