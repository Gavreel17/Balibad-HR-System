import bcrypt from 'bcryptjs';
console.log('bcryptjs imported successfully');
bcrypt.hash('test', 10).then(h => {
    console.log('Hash demo:', h);
    process.exit(0);
}).catch(e => {
    console.error('Bcrypt error:', e);
    process.exit(1);
});
