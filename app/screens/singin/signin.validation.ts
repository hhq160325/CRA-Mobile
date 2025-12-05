export const validateEmail = (
  email: string,
): {valid: boolean; error?: string} => {
  if (!email || email.trim() === '') {
    return {
      valid: false,
      error: 'Email is required',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      error: 'Please enter a valid email address',
    };
  }

  const emailLower = email.toLowerCase();
  if (
    !emailLower.endsWith('@carrental.com') &&
    !emailLower.endsWith('@gmail.com')
  ) {
    return {
      valid: false,
      error: 'Email must be a @carrental.com or @gmail.com address',
    };
  }

  return {valid: true};
};

export const validatePassword = (
  password: string,
): {valid: boolean; error?: string} => {
  if (!password || password.trim() === '') {
    return {
      valid: false,
      error: 'Password is required',
    };
  }

  if (password.length < 6) {
    return {
      valid: false,
      error: 'Password must be at least 6 characters',
    };
  }

  return {valid: true};
};
