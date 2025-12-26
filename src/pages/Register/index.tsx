import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { register } from "../Login/authService";
import { Input } from "../../components";
import { Button } from "../../components";
import { HOME_PATH, LOGIN_PATH } from "../../router/routePath";

const registerSchema = yup.object().shape({
  username: yup
    .string()
    .required("Tên người dùng là bắt buộc")
    .min(3, "Tên người dùng phải có ít nhất 3 ký tự")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới",
    ),
  email: yup.string().required("Email là bắt buộc").email("Email không hợp lệ"),
  password: yup
    .string()
    .required("Mật khẩu là bắt buộc")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: yup
    .string()
    .required("Xác nhận mật khẩu là bắt buộc")
    .oneOf([yup.ref("password")], "Mật khẩu xác nhận không khớp"),
});

import type { FormErrors } from "../../types";

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError("");

    try {
      await registerSchema.validate(
        { username, email, password, confirmPassword },
        { abortEarly: false },
      );

      await register({ username, email, password });
      navigate(HOME_PATH);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const validationErrors: FormErrors = {};
        err.inner.forEach((error) => {
          if (error.path) {
            validationErrors[error.path as keyof FormErrors] = error.message;
          }
        });
        setErrors(validationErrors);
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Đã có lỗi xảy ra, vui lòng thử lại");
      }
    }
  };

  const handleFieldChange = (
    field: "username" | "email" | "password" | "confirmPassword",
    value: string,
  ) => {
    switch (field) {
      case "username":
        setUsername(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "confirmPassword":
        setConfirmPassword(value);
        break;
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="container px-4 mx-auto min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
            Đăng ký
          </h2>
        </div>

        {submitError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <Input
              label="Tên người dùng"
              type="text"
              placeholder="Tên người dùng"
              value={username}
              onChange={(e) => handleFieldChange("username", e.target.value)}
              error={errors.username}
            />
          </div>

          <div className="mb-6">
            <Input
              label="Email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              error={errors.email}
            />
          </div>

          <div className="mb-6">
            <Input
              label="Mật khẩu"
              type="password"
              placeholder="**********"
              value={password}
              onChange={(e) => handleFieldChange("password", e.target.value)}
              error={errors.password}
            />
          </div>

          <div className="mb-6">
            <Input
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="**********"
              value={confirmPassword}
              onChange={(e) =>
                handleFieldChange("confirmPassword", e.target.value)
              }
              error={errors.confirmPassword}
            />
          </div>

          <Button type="submit" className="w-full">
            Đăng ký
          </Button>

          <p className="text-center font-extrabold mt-4 text-gray-600">
            Bạn đã có tài khoản?{" "}
            <Link className="text-red-500 hover:underline" to={LOGIN_PATH}>
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
