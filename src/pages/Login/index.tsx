import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useAuth } from "../../contexts/AuthContext";
import { Input } from "../../components";
import { Button } from "../../components";
import { REGISTER_PATH, HOME_PATH } from "../../router/routePath";

const loginSchema = yup.object().shape({
  email: yup.string().required("Email là bắt buộc").email("Email không hợp lệ"),
  password: yup
    .string()
    .required("Mật khẩu là bắt buộc")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

import type { FormErrors } from "../../types";

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError("");

    try {
      await loginSchema.validate({ email, password }, { abortEarly: false });

      await authLogin({ email, password });

      // Small delay to ensure token is saved before navigation
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Navigation will be handled by AuthContext based on user role
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
      } else {
        setSubmitError("Sai email hoặc mật khẩu");
      }
    }
  };

  const handleFieldChange = (field: "email" | "password", value: string) => {
    if (field === "email") {
      setEmail(value);
    } else {
      setPassword(value);
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="container px-4 mx-auto min-h-screen flex items-center justify-center ">
      <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
            Đăng nhập
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>

          <p className="text-center font-extrabold mt-4 text-gray-600">
            Bạn chưa có tài khoản?{" "}
            <Link className="text-red-500 hover:underline" to={REGISTER_PATH}>
              Đăng ký
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
