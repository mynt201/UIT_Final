/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useFormik } from "formik";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { authService } from "../../services/authService";
import type { User } from "../../types";
import { getThemeClasses } from "../../utils/themeUtils";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { Table, Button, Modal } from "../../components";
import { UserRole, ROLE_LABELS } from "../../constants/roles";
import type { UserRoleType, RoleFilterType } from "../../constants/roles";
import UserFormModal from "./Partials/UserFormModal";
import SearchAndFilter from "./Partials/SearchAndFilter";

/**
 * VALIDATION FEATURES:
 * - Real-time validation on change and blur
 * - Custom email regex validation
 * - Domain validation for emails
 * - Conditional password validation (required for create, optional for update)
 * - Username format validation (alphanumeric + underscore)
 * - Phone number format validation
 * - Character limits for all fields
 */

// Validation schema cho user form
const createUserSchema = yup.object().shape({
  username: yup
    .string()
    .required("Tên người dùng là bắt buộc")
    .min(3, "Tên người dùng phải có ít nhất 3 ký tự")
    .max(50, "Tên người dùng không được vượt quá 50 ký tự")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới",
    ),
  email: yup
    .string()
    .required("Email là bắt buộc")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Email không đúng định dạng (ví dụ: user@example.com)",
    )
    .max(100, "Email không được vượt quá 100 ký tự")
    .test("valid-email-domain", "Tên miền email không hợp lệ", (value) => {
      if (!value) return true;
      const domain = value.split("@")[1];
      // Kiểm tra một số domain phổ biến hoặc format cơ bản
      return Boolean(domain && domain.includes(".") && domain.length >= 4);
    }),
  password: yup
    .string()
    .required("Mật khẩu là bắt buộc")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
    ),
  // Role is not required for new users as they are always admins
  role: yup.string().optional(),
  fullName: yup
    .string()
    .max(100, "Họ tên không được vượt quá 100 ký tự")
    .optional(),
});

const updateUserSchema = yup.object().shape({
  username: yup
    .string()
    .required("Tên người dùng là bắt buộc")
    .min(3, "Tên người dùng phải có ít nhất 3 ký tự")
    .max(50, "Tên người dùng không được vượt quá 50 ký tự")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới",
    ),
  email: yup
    .string()
    .required("Email là bắt buộc")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Email không đúng định dạng (ví dụ: user@example.com)",
    )
    .max(100, "Email không được vượt quá 100 ký tự")
    .test("valid-email-domain", "Tên miền email không hợp lệ", (value) => {
      if (!value) return true;
      const domain = value.split("@")[1];
      // Kiểm tra một số domain phổ biến hoặc format cơ bản
      return Boolean(domain && domain.includes(".") && domain.length >= 4);
    }),
  password: yup
    .string()
    .optional()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
    ),
  role: yup
    .string()
    .required("Vai trò là bắt buộc")
    .oneOf([UserRole.SUPER_ADMIN, UserRole.WARD_ADMIN], "Vai trò không hợp lệ"),
  fullName: yup
    .string()
    .max(100, "Họ tên không được vượt quá 100 ký tự")
    .optional(),
});

const UserManagementPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null as number | null,
    prevPage: null as number | null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilterType>("all");
  const [wardFilter, setWardFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch administrative units (wards) for SUPER_ADMIN
  const { data: wardsData } = useQuery({
    queryKey: ["administrative-units"],
    queryFn: () => authService.getAdministrativeUnits(),
    enabled: currentUser?.role === UserRole.SUPER_ADMIN,
  });
  const wardOptions = (wardsData?.data || []).map(
    (w: { _id: string; name: string }) => ({
      value: String(w._id),
      label: w.name,
    }),
  );

  // Fetch users with React Query
  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: [
      "users",
      currentUser?.role,
      pagination.page,
      pagination.limit,
      debouncedSearchTerm,
      roleFilter,
      wardFilter,
      statusFilter,
      sortBy,
      sortOrder,
    ],
    queryFn: () => {
      const params: Record<string, unknown> = {
        page: pagination.page,
        limit: pagination.limit,
        sort: sortBy,
        order: sortOrder,
      };

      if (debouncedSearchTerm && debouncedSearchTerm.trim())
        params.search = debouncedSearchTerm.trim();
      if (roleFilter !== "all") params.role = roleFilter;
      if (statusFilter !== "all") params.isActive = statusFilter === "active";

      // Chỉ SUPER_ADMIN gửi ward_id; dùng string để đảm bảo đúng format
      if (
        currentUser?.role === UserRole.SUPER_ADMIN &&
        wardFilter &&
        wardFilter !== "all"
      ) {
        params.ward_id = String(wardFilter).trim();
      }

      return authService.getUsers(params);
    },
    enabled: !!currentUser,
    staleTime: 0,
    refetchOnMount: "always",
  });

  // Extract data from query result
  const users: User[] = usersData?.users ?? [];
  const paginationData: any = usersData?.pagination;

  // Use pagination from query data, fallback to local state
  const displayPagination = paginationData || pagination;

  // Check if search is in progress (debounced)
  const isSearching = searchTerm !== debouncedSearchTerm;

  // Mutations for CRUD operations
  const createUserMutation = useMutation({
    mutationFn: (userData: {
      username: string;
      email: string;
      password: string;
      fullName?: string;
      role?: UserRoleType;
      ward_id?: string | null;
    }) => authService.createAdminUser(userData),
    onSuccess: () => {
      toast.success(t("userManagement.toastAddSuccess"));
      queryClient.invalidateQueries({ queryKey: ["users"] });
      handleCloseModal();
      userFormik.resetForm();
    },
    onError: (error: any) => {
      const apiError = error?.data?.error;
      const errorDetails = error?.data?.details;

      // Parse and set field-specific errors
      const fieldErrors: Record<string, string> = {};

      if (apiError) {
        if (apiError.includes("Email already registered")) {
          fieldErrors.email = "Email này đã được đăng ký";
        } else if (apiError.includes("Username already taken")) {
          fieldErrors.username = "Tên người dùng này đã tồn tại";
        } else if (
          apiError.includes("uppercase") ||
          apiError.includes("lowercase") ||
          apiError.includes("Password must contain")
        ) {
          fieldErrors.password =
            "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số";
        } else if (
          apiError.includes("Username, email, and password are required")
        ) {
          if (!userFormik.values.username)
            fieldErrors.username = "Tên người dùng là bắt buộc";
          if (!userFormik.values.email) fieldErrors.email = "Email là bắt buộc";
          if (!userFormik.values.password)
            fieldErrors.password = "Mật khẩu là bắt buộc";
        } else if (
          apiError.includes("Validation failed") &&
          Array.isArray(errorDetails)
        ) {
          // Parse detailed validation errors
          errorDetails.forEach((detail: any) => {
            const field = detail.field;
            const message = detail.message;

            if (field === "username") {
              fieldErrors.username = message.includes("between 3 and 50")
                ? "Tên người dùng phải có 3-50 ký tự"
                : message.includes("letters, numbers, and underscores")
                  ? "Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới"
                  : "Tên người dùng không hợp lệ";
            } else if (field === "email") {
              fieldErrors.email = message.includes("valid email")
                ? "Email không đúng định dạng"
                : "Email không hợp lệ";
            } else if (field === "password") {
              fieldErrors.password = message.includes("at least 6")
                ? "Mật khẩu phải có ít nhất 6 ký tự"
                : "Mật khẩu không hợp lệ";
            }
          });
        } else if (apiError.includes("User already exists")) {
          fieldErrors.email = "Người dùng này đã tồn tại";
          fieldErrors.username = "Người dùng này đã tồn tại";
        }
      }

      // Set field errors in Formik
      if (Object.keys(fieldErrors).length > 0) {
        userFormik.setErrors(fieldErrors);
      }

      // Show toast error
      const errorMessage =
        apiError || error?.message || t("userManagement.toastAddError");
      toast.error(errorMessage);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: Partial<User> }) =>
      authService.updateUser(id, userData),
    onSuccess: () => {
      toast.success(t("userManagement.toastUpdateSuccess"));
      queryClient.invalidateQueries({ queryKey: ["users"] });
      handleCloseModal();
      userFormik.resetForm();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.data?.error ||
        error?.message ||
        t("userManagement.toastUpdateError");
      toast.error(errorMessage);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => authService.deleteUser(userId),
    onSuccess: () => {
      toast.success(t("userManagement.toastDeleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.data?.error || error?.message || t("userManagement.toastDeleteError");
      toast.error(errorMessage);
    },
  }); // Separate loading for API calls

  // Custom handleChange to clear API errors when user starts typing
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    // Clear API errors when user starts typing
    const currentErrors = userFormik.errors;
    const apiErrorFields = ["username", "email", "password"]; // Fields that can have API errors

    if (
      apiErrorFields.includes(e.target.name) &&
      currentErrors[e.target.name as keyof typeof currentErrors]
    ) {
      // Clear the specific field error if it exists
      const newErrors = { ...currentErrors };
      delete newErrors[e.target.name as keyof typeof currentErrors];
      userFormik.setErrors(newErrors);
    }

    // Call original handleChange
    userFormik.handleChange(e);
  };

  // Formik cho user form
  const userFormik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      role: UserRole.WARD_ADMIN as UserRoleType,
      fullName: "",
      ward_id: "" as string,
    },
    validationSchema: isEditMode ? updateUserSchema : createUserSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      // Clear any existing API errors before submitting
      userFormik.setErrors({});

      if (isEditMode && editingUser) {
        // Update user
        const updateData: Record<string, unknown> = {
          username: values.username,
          email: values.email,
          role: values.role,
          full_name: values.fullName || undefined,
          fullName: values.fullName || undefined,
          ward_id: values.ward_id || undefined,
        };
        if (values.password) {
          updateData.password = values.password;
        }
        updateUserMutation.mutate({
          id: editingUser._id as string,
          userData: updateData,
        });
      } else {
        // Create new user - WARD_ADMIN auto-gets ward; SUPER_ADMIN sends role + ward_id
        createUserMutation.mutate({
          username: values.username,
          email: values.email,
          password: values.password,
          fullName: values.fullName || undefined,
          role: values.role as UserRoleType,
          ward_id: values.role === UserRole.WARD_ADMIN ? values.ward_id || null : null,
        });
      }
    },
  });

  const filteredUsers = useMemo(() => {
    // Since we're using server-side filtering, filteredUsers is just users
    return users;
  }, [users]);

  const handleOpenModal = (user?: User) => {
    if (user && user._id) {
      setIsEditMode(true);
      setEditingUser(user);
      userFormik.setValues({
        username: user.username,
        email: user.email,
        password: "",
        role: user.role,
        fullName: user.full_name || (user as any).fullName || "",
        ward_id: user.ward_id ? String(user.ward_id) : "",
      });
    } else {
      setIsEditMode(false);
      setEditingUser(null);
      userFormik.resetForm({
        values: {
          username: "",
          email: "",
          password: "",
          role:
            currentUser?.role === UserRole.SUPER_ADMIN ? UserRole.WARD_ADMIN : UserRole.WARD_ADMIN,
          fullName: "",
          ward_id: currentUser?.ward_id ? String(currentUser.ward_id) : "",
        },
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingUser(null);
    userFormik.resetForm();
  };

  // Debounced search function - chờ 500ms sau lần nhập cuối cùng
  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        setDebouncedSearchTerm(term);
        setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
      }, 500),
    [],
  );

  const handleSearch = (term: string) => {
    // Update local state immediately for UI feedback
    setSearchTerm(term);
    // Debounce the actual search/filter operation
    debouncedSearch(term);
  };

  const handleRoleFilter = (role: RoleFilterType) => {
    setRoleFilter(role);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleWardFilter = (ward: string) => {
    setWardFilter(ward);
    setPagination((prev) => ({ ...prev, page: 1 }));
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const handleStatusFilter = (status: "all" | "active" | "inactive") => {
    setStatusFilter(status);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleSort = (newSortBy: string) => {
    const newSortOrder =
      sortBy === newSortBy && sortOrder === "desc" ? "asc" : "desc";
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;
    deleteUserMutation.mutate(userToDelete._id, {
      onSuccess: () => setUserToDelete(null),
    });
  };

  const handleDeleteCancel = () => {
    setUserToDelete(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t("userManagement.noDate");
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div
      className={`p-4 md:p-6 space-y-4 md:space-y-6 ${themeClasses.background}`}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 ${themeClasses.text}`}>
          {t("userManagement.title")}
        </h1>
        <p className={themeClasses.textSecondary}>
          {t("userManagement.subtitle")}
        </p>
      </div>

      {/* Filters and Actions */}
      <div
        className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-4`}
      >
        <div
          className={`grid grid-cols-1 gap-4 mb-4 ${currentUser?.role === UserRole.SUPER_ADMIN ? "md:grid-cols-4" : "md:grid-cols-3"}`}
        >
          <div
            className={
              currentUser?.role === UserRole.SUPER_ADMIN
                ? "md:col-span-3"
                : "md:col-span-2"
            }
          >
            <SearchAndFilter
              searchTerm={searchTerm}
              roleFilter={roleFilter}
              wardFilter={wardFilter}
              statusFilter={statusFilter}
              onSearchChange={handleSearch}
              onRoleFilterChange={handleRoleFilter}
              onWardFilterChange={handleWardFilter}
              onStatusFilterChange={handleStatusFilter}
              disabled={loadingUsers}
              isSearching={isSearching}
              showWardFilter={currentUser?.role === UserRole.SUPER_ADMIN}
              wardOptions={wardOptions}
            />
          </div>
          <div className="flex justify-end h-fit my-5">
            <Button
              variant="success"
              onClick={() => handleOpenModal({ role: UserRole.WARD_ADMIN } as User)}
              className="flex items-center gap-2"
            >
              <FaPlus />
              <span>{t("userManagement.addUser")}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="relative">
        {loadingUsers && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-600">{t("userManagement.loading")}</span>
            </div>
          </div>
        )}
        <Table
          columns={[
            {
              header: t("userManagement.colUsername"),
              accessor: "username",
              render: (value) => (
                <button
                  onClick={() => handleSort("username")}
                  className={`flex items-center gap-1 hover:text-blue-500 transition-colors ${themeClasses.text}`}
                >
                  {String(value)}
                  {sortBy === "username" && (
                    <span className="text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              ),
            },
            {
              header: t("userManagement.colEmail"),
              accessor: "email",
              render: (value) => String(value),
            },
            {
              header: t("userManagement.colFullName"),
              accessor: "full_name",
              render: (value, row) => (
                <button
                  onClick={() => handleSort("name")}
                  className={`flex items-center gap-1 hover:text-blue-500 transition-colors ${themeClasses.text}`}
                >
                  {String(value || (row as any).fullName || "-")}
                  {sortBy === "name" && (
                    <span className="text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              ),
            },
            {
              header: t("userManagement.colRole"),
              accessor: "role",
              render: (value) => (
                <button
                  onClick={() => handleSort("role")}
                  className={`flex items-center gap-1 hover:text-blue-500 transition-colors`}
                >
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      value === UserRole.SUPER_ADMIN
                        ? theme === "light"
                          ? "bg-indigo-500/20 text-indigo-600"
                          : "bg-indigo-500/20 text-indigo-400"
                        : `${
                            theme === "light"
                              ? "bg-gray-300/50 text-gray-600"
                              : "bg-gray-500/20 text-gray-400"
                          }`
                    }`}
                  >
                    {value === UserRole.SUPER_ADMIN ? ROLE_LABELS[UserRole.SUPER_ADMIN] : ROLE_LABELS[UserRole.WARD_ADMIN]}
                  </span>
                  {sortBy === "role" && (
                    <span className="text-xs ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              ),
            },
            ...(currentUser?.role === UserRole.SUPER_ADMIN
              ? [
                  {
                    header: t("userManagement.colWard"),
                    accessor: "ward_id",
                    render: (value: string, row: any) => {
                      const wardId = value || row.ward_id;
                      const ward = wardOptions.find((w) => w.value === wardId);
                      return (
                        <span>
                          {ward ? ward.label : wardId ? "-" : "Super Admin"}
                        </span>
                      );
                    },
                  },
                ]
              : []),
            {
              header: "Ngày tạo",
              accessor: "createdAt",
              render: (value) => (
                <button
                  onClick={() => handleSort("createdAt")}
                  className={`flex items-center gap-1 hover:text-blue-500 transition-colors ${themeClasses.text}`}
                >
                  <span className="text-sm">
                    {formatDate(value as string | undefined)}
                  </span>
                  {sortBy === "createdAt" && (
                    <span className="text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              ),
            },
            {
              header: t("userManagement.colLastLogin"),
              accessor: "lastLogin",
              render: (value) => (
                <button
                  onClick={() => handleSort("lastLogin")}
                  className={`flex items-center gap-1 hover:text-blue-500 transition-colors ${themeClasses.text}`}
                >
                  <span className="text-sm">
                    {formatDate(value as string | undefined)}
                  </span>
                  {sortBy === "lastLogin" && (
                    <span className="text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              ),
            },
            {
              header: t("userManagement.colActions"),
              accessor: "id",
              render: (_, row) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(row as User)}
                    className={`p-2 rounded transition-colors ${
                      theme === "light"
                        ? "text-indigo-600 hover:bg-indigo-500/20"
                        : "text-indigo-400 hover:bg-indigo-500/20"
                    }`}
                    title={t("common.edit")}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(row as User)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                    title={t("common.delete")}
                  >
                    <FaTrash />
                  </button>
                </div>
              ),
            },
          ]}
          data={filteredUsers}
          emptyMessage={t("userManagement.emptyMessage")}
        />
      </div>

      {/* Pagination */}
      {displayPagination.total > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <div className="text-sm text-gray-600">
            {t("userManagement.paginationShow", {
              from: (displayPagination.page - 1) * displayPagination.limit + 1,
              to: Math.min(
                displayPagination.page * displayPagination.limit,
                displayPagination.total,
              ),
              total: displayPagination.total,
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* Items per page selector */}
            <select
              value={displayPagination.limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              disabled={loadingUsers}
              className="px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value={10}>{t("userManagement.perPage", { n: 10 })}</option>
              <option value={25}>{t("userManagement.perPage", { n: 25 })}</option>
              <option value={50}>{t("userManagement.perPage", { n: 50 })}</option>
              <option value={100}>{t("userManagement.perPage", { n: 100 })}</option>
            </select>

            {/* Page navigation */}
            <div className="flex gap-1">
              <button
                onClick={() => handlePageChange(displayPagination.page - 1)}
                disabled={!displayPagination.hasPrevPage || loadingUsers}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ‹ Trước
              </button>

              {/* Page numbers */}
              {Array.from(
                { length: Math.min(5, displayPagination.pages) },
                (_, i) => {
                  let pageNum;
                  if (displayPagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (displayPagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (
                    displayPagination.page >=
                    displayPagination.pages - 2
                  ) {
                    pageNum = displayPagination.pages - 4 + i;
                  } else {
                    pageNum = displayPagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                        pageNum === displayPagination.page
                          ? "bg-blue-500 text-white border-blue-500"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                      disabled={loadingUsers}
                    >
                      {pageNum}
                    </button>
                  );
                },
              )}

              <button
                onClick={() => handlePageChange(displayPagination.page + 1)}
                disabled={!displayPagination.hasNextPage || loadingUsers}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau ›
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!userToDelete}
        onClose={handleDeleteCancel}
        title="Xác nhận xóa"
        maxWidth="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={handleDeleteCancel}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Đang xóa..." : "Xóa"}
            </Button>
          </div>
        }
      >
        <p className={themeClasses.text}>
          Bạn có chắc chắn muốn xóa người dùng{" "}
          <strong>{userToDelete?.username}</strong> ({userToDelete?.email})?
          Hành động này không thể hoàn tác.
        </p>
      </Modal>

      {/* Add/Edit Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={
          userFormik.handleSubmit as (
            e?: React.FormEvent<HTMLFormElement>,
          ) => void
        }
        isEditMode={isEditMode}
        formik={userFormik}
        handleFormChange={handleFormChange}
        loading={
          userFormik.isSubmitting ||
          createUserMutation.isPending ||
          updateUserMutation.isPending
        }
        wardOptions={wardOptions}
        canSelectRole={currentUser?.role === UserRole.SUPER_ADMIN}
        canSelectWard={currentUser?.role === UserRole.SUPER_ADMIN}
      />
    </div>
  );
};

export default UserManagementPage;
