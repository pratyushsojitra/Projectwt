import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

export default function AuthForm({ onSubmit, isUser = true, showModal, handleClose }) {
  const [isSignIn, setIsSignIn] = useState(true);
  const [input, setInput] = useState({ name: '', mobile: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSubmit(input, isSignIn);
      setInput({ name: '', mobile: '', email: '', password: '' });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to sign in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const changeMode = () => {
    setIsSignIn(!isSignIn);
    setError('');
  };

  return (
    <Modal show={showModal} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isSignIn ? 'Welcome back' : 'Create your account'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="auth-form">
          {!isSignIn && <>
            <label>{isUser ? 'Name' : 'Business name'}
              <input required minLength="2" autoComplete="name" value={input.name} onChange={(event) => setInput({ ...input, name: event.target.value })} />
            </label>
            <label>Phone
              <input required type="tel" autoComplete="tel" value={input.mobile} onChange={(event) => setInput({ ...input, mobile: event.target.value })} />
            </label>
          </>}
          <label>Email
            <input required type="email" autoComplete="email" value={input.email} onChange={(event) => setInput({ ...input, email: event.target.value })} />
          </label>
          <label>Password
            <input required minLength="8" type="password" autoComplete={isSignIn ? 'current-password' : 'new-password'} value={input.password} onChange={(event) => setInput({ ...input, password: event.target.value })} />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary w-100" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : isSignIn ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <p className="auth-switch">
          {isSignIn ? 'New here?' : 'Already have an account?'}{' '}
          <button type="button" onClick={changeMode}>{isSignIn ? 'Create account' : 'Sign in'}</button>
        </p>
      </Modal.Body>
    </Modal>
  );
}
