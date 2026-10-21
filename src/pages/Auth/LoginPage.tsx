import './AuthPage.scss';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  email: z.string().check(z.email('Некорректный email')),
  password: z.string().min(6, 'Минимум 6 символов'),
});

type loginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<loginFormData>({ resolver: zodResolver(loginSchema) });
  const onSubmit = async (data: loginFormData) => {
    const { error } = await signIn(data.email, data.password);

    if (error) {
      setError('root', { message: error }); // установка програмной ошибки в форме
      return;
    }

    navigate('/');
  };

  return (
    <div className='auth-page'>
      <div className='auth-card'>
        <h1 className='auth-card__title'>Вход</h1>

        <form action='' className='auth-form' onSubmit={handleSubmit(onSubmit)}>
          <div className='auth-form__field'>
            <label htmlFor='email'>Email</label>
            <input
              id='email'
              type='email'
              placeholder='you@example.com'
              autoComplete='email'
              {...register('email')}
            />

            {errors.email && <span className='auth-form__error'>{errors.email.message}</span>}
          </div>

          <div className='auth-form__field'>
            <label htmlFor='password'>Пароль</label>
            <input
              type='password'
              id='password'
              placeholder='.......'
              autoComplete='current-password'
              {...register('password')}
            />

            {errors.password && <span className='auth-form__error'>{errors.password.message}</span>}
          </div>

          {errors.root && (
            <div className='auth-form__error auth-form__error--block'>{errors.root.message}</div>
          )}

          <button className='auth-form__submit' type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className='auth-card__footer'>
          Нет аккаунта? <Link to='/register'>Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
};
