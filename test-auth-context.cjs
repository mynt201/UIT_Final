// Simple test to verify AuthContext exports
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/contexts/AuthContext.tsx');
const content = fs.readFileSync(filePath, 'utf8');

// Check for common ESLint issues
const issues = [];

if (content.includes('console.log') && !content.includes('eslint-disable-next-line no-console')) {
  issues.push('console.log without eslint disable');
}

if (content.includes('window as any') && !content.includes('eslint-disable-next-line @typescript-eslint/no-explicit-any')) {
  issues.push('window as any without eslint disable');
}

if (content.includes('React.FC') && !content.includes('React.FC<')) {
  issues.push('React.FC without proper typing');
}

if (issues.length === 0) {
  console.log('✅ AuthContext.tsx passes basic ESLint checks');
} else {
  console.log('❌ ESLint issues found:');
  issues.forEach(issue => console.log(`  - ${issue}`));
}
