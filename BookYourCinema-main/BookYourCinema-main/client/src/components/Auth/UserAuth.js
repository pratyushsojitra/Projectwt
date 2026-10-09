import { useAuth } from '../../context/AuthContext';
import { userAuthRequest } from '../../api-helpers/api-helper';
import AuthForm from './AuthForm';

export default function UserAuth() {
  const { session, showAuth, openAuth, closeAuth, login, logout } = useAuth();

  const handleAuthSubmit = async (input, isSignIn) => {
    const result = await userAuthRequest(input, isSignIn);
    login(result, 'user');
  };

  return (
    <>
      {session?.role === 'user' ? (
        <div className="account-actions">
          <span className="account-name">Hi, {session.username}</span>
          <button className="button button-outline" type="button" onClick={logout}>Sign out</button>
        </div>
      ) : (
        <button className="button button-primary" type="button" onClick={openAuth}>Sign in</button>
      )}
      <AuthForm onSubmit={handleAuthSubmit} isUser showModal={showAuth} handleClose={closeAuth} />
    </>
  );
}
