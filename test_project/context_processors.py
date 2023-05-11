from django.contrib.auth.forms import AuthenticationForm
from .forms import RegistrationForm, SetNewPasswordForm


def header(request):
    if not request.user.is_authenticated:
        reg_form = RegistrationForm
        auth_form = AuthenticationForm
        set_password_form = None
    else:
        auth_form, reg_form = None, None
        set_password_form = SetNewPasswordForm(user=request.user)

    return {
        'auth_form': auth_form,
        'reg_form': reg_form,
        'set_password_form': set_password_form,
    }
