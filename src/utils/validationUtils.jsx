// src/utils/validationUtils.js
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUserName = (userName) => {
  if (userName.length < 6) {
    return "Tên người dùng phải có ít nhất 6 ký tự";
  }

  if (userName.length > 20) {
    return "Tên người dùng không được vượt quá 20 ký tự";
  }

  const userNameRegex = /^[a-zA-Z0-9]+$/;
  if (!userNameRegex.test(userName)) {
    return "Tên người dùng không được chứa ký tự đặc biệt";
  }
  // Có thể thêm các validate khác cho userName nếu cần
  return "";
};

export const validatePhoneNumber = (phoneNo) => {
  if (phoneNo.length < 10) {
    return "Số điện thoại phải có ít nhất 10 số";
  }
  if (!/^\d*$/.test(phoneNo)) {
    return "Chỉ được nhập số";
  }
  return "";
};

export const validatePassword = (password) => {
  // Regex: ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt, tối thiểu 8 ký tự
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  if (!passwordRegex.test(password)) {
    return "Mật khẩu phải có ít nhất 8 ký tự, bao gồm 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt";
  }
  // Bạn có thể thêm các validate phức tạp hơn cho password ở đây nếu cần
  return "";
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return "Mật khẩu không khớp";
  }
  return "";
};

export const validateRequiredFields = (userData) => {
  if (!userData || !userData.Email || !userData.PasswordHash) {
    return "Email và mật khẩu là bắt buộc";
  }
  return "";
};

export const validateUserEmail = (email) => {
  if (!email) {
    return "Email là bắt buôc!";
  }
  if (!validateEmail(email)) {
    return "Email không hợp lệ";
  }
  return "";
};

// Thêm vào hàm validateRegisterForm tổng hợp
export const validateRegisterForm = (form, confirmPassword) => {
  const errors = {
    userName: validateUserName(form.UserName),
    email: validateUserEmail(form.Email),
    phoneNo: validatePhoneNumber(form.PhoneNo),
    passwordHash: validatePassword(form.PasswordHash),
    confirmPassword: validateConfirmPassword(
      form.PasswordHash,
      confirmPassword
    ),
    requiredFields: validateRequiredFields(form),
  };

  const isValid = !Object.values(errors).some((error) => error !== "");
  return { errors, isValid };
};

// Validate riêng cho Login
export const validateLoginForm = (form) => {
  const errors = {
    email: validateUserEmail(form.Email)
  };
  return { errors, isValid: !Object.values(errors).some((error) => error) };
};

// Hàm validate trước khi gọi API
export const validateBeforeApiCall = (userData) => {
  const requiredError = validateRequiredFields(userData);
  if (requiredError) {
    return { isValid: false, error: requiredError, status: 400 };
  }

  const emailError = validateUserEmail(userData.Email);
  if (emailError) {
    return { isValid: false, error: emailError, status: 400 };
  }

  return { isValid: true };
};
