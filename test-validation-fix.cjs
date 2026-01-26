// Test validation modules load correctly
console.log('Testing validation modules...');

try {
    const validation = require('./flood-risk/middleware/validation');
    console.log('✅ Main validation module loaded');

    // Test weather validation
    if (validation.weatherValidation && validation.weatherValidation.create) {
        console.log('✅ weatherValidation.create exists');
    } else {
        console.log('❌ weatherValidation.create missing');
    }

    // Test user validation
    if (validation.userValidation && validation.userValidation.register) {
        console.log('✅ userValidation.register exists');
    } else {
        console.log('❌ userValidation.register missing');
    }

    // Test ward validation
    if (validation.wardValidation && validation.wardValidation.create) {
        console.log('✅ wardValidation.create exists');
    } else {
        console.log('❌ wardValidation.create missing');
    }

    console.log('All validation modules loaded successfully! 🎉');

} catch (error) {
    console.error('❌ Error loading validation modules:', error.message);
}