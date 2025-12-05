export const validateLicenseNumber = (value: string): boolean => {
  const cleaned = value.replace(/[\s-]/g, '');

  return /^\d{12}$/.test(cleaned);
};

export const validateDate = (value: string): boolean => {
  const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = value.match(dateRegex);

  if (!match) return false;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;

  return true;
};

export const validateDateOfBirth = (
  value: string,
): {valid: boolean; error?: string} => {
  if (!validateDate(value)) {
    return {
      valid: false,
      error: 'Please enter date in format: day/month/year (e.g., 15/01/1990)',
    };
  }

  const [day, month, year] = value.split('/').map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (birthDate > today) {
    return {
      valid: false,
      error: 'Date of birth cannot be in the future.',
    };
  }

  if (age < 18 || (age === 18 && monthDiff < 0)) {
    return {
      valid: false,
      error: 'You must be at least 18 years old.',
    };
  }

  return {valid: true};
};

export const validateLicenseExpiry = (
  value: string,
): {valid: boolean; error?: string} => {
  if (!validateDate(value)) {
    return {
      valid: false,
      error: 'Please enter date in format: day/month/year (e.g., 15/12/2025)',
    };
  }

  const [day, month, year] = value.split('/').map(Number);
  const expiryDate = new Date(year, month - 1, day);
  const today = new Date();

  if (expiryDate < today) {
    return {
      valid: false,
      error: 'License expiry date must be in the future.',
    };
  }

  return {valid: true};
};
