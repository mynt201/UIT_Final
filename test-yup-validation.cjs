// Test Yup validation in userController
const yup = require('yup');

// Test schemas
const loginSchema = yup.object().shape({
    email: yup
        .string()
        .required('Email là bắt buộc')
        .email('Email không hợp lệ'),
    password: yup
        .string()
        .required('Mật khẩu là bắt buộc')
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
});

const registerSchema = yup.object().shape({
    username: yup
        .string()
        .required('Tên đăng nhập là bắt buộc')
        .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
        .max(50, 'Tên đăng nhập không được vượt quá 50 ký tự')
        .matches(/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'),
    email: yup
        .string()
        .required('Email là bắt buộc')
        .email('Email không hợp lệ'),
    password: yup
        .string()
        .required('Mật khẩu là bắt buộc')
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    fullName: yup
        .string()
        .optional()
        .max(100, 'Họ tên không được vượt quá 100 ký tự'),
    phone: yup
        .string()
        .optional()
        .matches(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ'),
    address: yup
        .string()
        .optional()
        .max(200, 'Địa chỉ không được vượt quá 200 ký tự')
});

async function testValidation() {
    console.log('🧪 Testing Yup Validation...\n');

    // Test 1: Valid login
    try {
        const validLogin = await loginSchema.validate({
            email: 'admin@example.com',
            password: 'admin123'
        });
        console.log('✅ Valid login passed:', validLogin.email);
    } catch (error) {
        console.log('❌ Valid login failed:', error.message);
    }

    // Test 2: Invalid login - missing password
    try {
        await loginSchema.validate({
            email: 'admin@example.com'
        });
    } catch (error) {
        console.log('✅ Invalid login caught:', error.errors[0]);
    }

    // Test 3: Invalid login - bad email
    try {
        await loginSchema.validate({
            email: 'invalid-email',
            password: 'password123'
        });
    } catch (error) {
        console.log('✅ Bad email caught:', error.errors[0]);
    }

    // Test 4: Valid register
    try {
        const validRegister = await registerSchema.validate({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            fullName: 'Test User'
        });
        console.log('✅ Valid register passed:', validRegister.username);
    } catch (error) {
        console.log('❌ Valid register failed:', error.message);
    }

    // Test 5: Invalid register - bad username
    try {
        await registerSchema.validate({
            username: 'us',
            email: 'test@example.com',
            password: 'password123'
        });
    } catch (error) {
        console.log('✅ Bad username caught:', error.errors[0]);
    }

    // Test 6: Invalid register - special chars in username
    try {
        await registerSchema.validate({
            username: 'user@name',
            email: 'test@example.com',
            password: 'password123'
        });
    } catch (error) {
        console.log('✅ Special chars in username caught:', error.errors[0]);
    }

    console.log('\n🎉 Yup validation testing completed!');
}

// Run test
testValidation().catch(console.error);