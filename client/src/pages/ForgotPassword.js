import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase'; // Make sure path is correct
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMsg('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Reset email sent! Please check your inbox.');
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const goBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <h2>Reset Password</h2>
      <form onSubmit={handleReset} style={styles.form}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Send Reset Email</button>
      </form>

      {message && <p style={styles.success}>{message}</p>}
      {errorMsg && <p style={styles.error}>{errorMsg}</p>}

      <p>
        <button onClick={goBackToLogin} style={styles.linkButton}>Back to Login</button>
      </p>
    </div>
  );
}

const styles = {
  container: {
    width: '300px',
    margin: 'auto',
    paddingTop: '100px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
  },
  button: {
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: 'blue',
    textDecoration: 'underline',
    cursor: 'pointer',
    marginTop: '10px',
  },
  success: {
    color: 'green',
  },
  error: {
    color: 'red',
  },
};

export default ForgotPassword;