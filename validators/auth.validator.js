const {z} = require('zod');
const loginSchema = z.object({
    email: z.email({message: 'Invalid email address'}),
    password: z.string().min(8, {message: 'Password must be at least 8 characters long'})
});
    
module.exports = {
    loginSchema
}