from django.contrib.auth.forms import UserCreationForm, SetPasswordForm
from customusers.models import CustomUser
from django import forms
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.core.exceptions import ValidationError
from django.contrib.auth.tokens import default_token_generator


class ResetPasswordForm(SetPasswordForm):
    new_password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password", 'placeholder': 'Введите пароль'}),
        strip=False
    )
    new_password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password", 'placeholder': 'Подтвердите пароль'}),
        strip=False
    )
    uidb64 = forms.CharField(
        widget=forms.HiddenInput(),
    )
    token = forms.CharField(
        widget=forms.HiddenInput()
    )

    def clean_uidb64(self):
        uidb64 = self.cleaned_data["uidb64"]
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
        except(TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            raise ValidationError(
                'Invalid uidb64',
                code='invalid'
            )

        if user is None:
            raise ValidationError(
                'User not found',
                code='Not found'
            )
        return uidb64

    def clean_token(self):
        token = self.cleaned_data["token"]
        uidb64 = self.cleaned_data["uidb64"]
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = CustomUser.objects.get(pk=uid)
        if not default_token_generator.check_token(user, token):
            raise ValidationError(
                'Invalid token',
                code='invalid'
            )
        return token


class RegistrationForm(UserCreationForm):
    first_name = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'Имя'}),
                                 max_length=32, help_text='Имя')
    last_name = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'Фамилия'}),
                                max_length=32, help_text='Фамилия')
    email = forms.EmailField(widget=forms.EmailInput(attrs={'placeholder': 'Email'}),
                             max_length=64, help_text='Email')
    password1 = forms.CharField(
        label="Пароль",
        strip=False,
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password", 'placeholder': 'Пароль'}),
    )
    password2 = forms.CharField(
        label="Подтверждение пароля",
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password", 'placeholder': 'Повторите пароль'}),
        strip=False,
    )

    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = ('first_name', 'last_name', 'email', 'password1', 'password2')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class SetNewPasswordForm(SetPasswordForm):
    old_password = forms.CharField(
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password", "placeholder": "Старый пароль"}),
        strip=False,
    )

    new_password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password", "placeholder": "Новый пароль"}),
        strip=False,
    )

    new_password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password", "placeholder": "Введите новый пароль повторно"}),
        strip=False,
    )

    def clean_old_password(self):
        password = self.cleaned_data.get('old_password')
        if not self.user.check_password(password):
            raise ValidationError(
                'Неверный пароль',
                code='invalid'
            )
        return password
