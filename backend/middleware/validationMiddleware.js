const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const validatePassword = (password) => {
  // Min 8 chars, at least one letter, one number and one special character
  const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return re.test(password);
};

const validateMobile = (mobile) => {
  const re = /^[0-9]{10}$/;
  return re.test(mobile);
};

const validateIFSC = (ifsc) => {
  const re = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return re.test(ifsc);
};

export const validateMentorSignup = (req, res, next) => {
  const { name, email, mobileNumber, password, confirmPassword, bankDetails } = req.body;

  if (!name || !email || !mobileNumber || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Please fill all required fields' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ 
      message: 'Password must be at least 8 characters long and contain at least one letter, one number, and one special character' 
    });
  }

  if (!validateMobile(mobileNumber)) {
    return res.status(400).json({ message: 'Mobile number must be 10 digits' });
  }

  if (bankDetails && bankDetails.ifscCode && !validateIFSC(bankDetails.ifscCode)) {
    return res.status(400).json({ message: 'Invalid IFSC code format' });
  }

  next();
};


