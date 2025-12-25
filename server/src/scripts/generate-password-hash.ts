import bcrypt from 'bcrypt';

async function generateHash() {
  const password = 'YaMahdi313!';
  const hash = await bcrypt.hash(password, 10);
  
  console.log('\nPassword hash generated successfully!\n');
  console.log('Add this to your .env file:');
  console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
  console.log('Also set these environment variables:');
  console.log('ADMIN_USERNAME=admin');
  console.log('JWT_SECRET=your-secret-key-change-in-production\n');
}

generateHash().catch(console.error);

