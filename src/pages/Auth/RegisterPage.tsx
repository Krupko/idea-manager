import './AuthPage.scss';
import { useAuth } from '@/hooks/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';

const registerShema = z
  .object({
    email: z.string().check(z.email('Некорректный email')),
    password: z.string().min(6, 'Минимум 6 символов'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'], // приыязка ошибки к полю confirmPassword
  });

type RegisterFormData = z.infer<typeof registerShema>;

export const RegisterPage = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerShema) });

  const onSubmit = async (data: RegisterFormData) => {
    const { error } = await signUp(data.email, data.password);

    if (error) {
      setError('root', { message: error });
      return;
    }

    navigate('/');
  };

  return (
    <div className='auth-page'>
      <div className='auth-card'>
        <h1 className='auth-card__title'>Регистрация</h1>

        <form className='auth-form' onSubmit={handleSubmit(onSubmit)}>
          <div className='auth-form__field'>
            <label htmlFor='email'>Email</label>
            <input
              type='email'
              id='email'
              placeholder='you@exmple.com'
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
              placeholder='......'
              autoComplete='new-password'
              {...register('password')}
            />
            {errors.password && <span className='auth-form__error'>{errors.password.message}</span>}
          </div>

          <div className='auth-form__field'>
            <label htmlFor='confirmPassword'>Повторите пароль</label>
            <input
              type='password'
              id='confirmPassword'
              placeholder='......'
              autoComplete='new-password'
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <span className='auth-form__error'>{errors.confirmPassword.message}</span>
            )}
          </div>

          {errors.root && (
            <div className='auth-form__error auth-form__error--block'>{errors.root.message}</div>
          )}

          <button className='auth-form__submit' type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className='auth-card__footer'>
          Уже есть аккаунт? <Link to='/login'>Войти</Link>
        </p>
      </div>
    </div>
  );
};
