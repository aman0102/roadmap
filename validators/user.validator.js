// // Custom validator for user creation
// const validateCreateUser = (req, res,next) =>{
//     const {name, email, password} = req.body;
//     if(!name){
//         return res.status(400).json({message: 'Name is required'});
//     }
//     if(!email || !email.includes('@')){
//         return res.status(400).json({message: 'Valid email is required'});
//     }
//     if(!password){
//         return res.status(400).json({message: 'Password is required'});
//     }
//     next();
// }
// module.exports = {
//     validateCreateUser
// }

// Using Zod for validation
const {z} = require('zod');
// Both schemas are same but still created two different schemas for better understanding and future scalability.
const createUserSchema = z.object({
    name: z.string().trim().min(2, {message: 'Name must be at least 2 characters long'}),
    email: z.email({message: 'Invalid email address'}).transform(email => email.toLowerCase()),
    password: z.string().min(8, {message: 'Password must be at least 8 characters long'})
});

const updateUserSchema = z.object({
    name: z.string().trim().min(2, {message: 'Name must be at least 2 characters long'}).optional(),
    email: z.email({message: 'Invalid email address'}).transform(email => email.toLowerCase()).optional(),
    password: z.string().min(8, {message: 'Password must be at least 8 characters long'}).optional()
});

const userIdSchema = z.object({
    id: z.coerce.number().int().positive({message: 'User ID must be a positive number'})
});
//  Role can be either 'user' or 'admin', this schema is used to validate the role of a user when updating the role of a user, this schema should only be used by an admin user
const updateUserRoleSchema = z.object({
    role: z.enum(['user', 'admin'])
});

const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    role: z.enum(['user', 'admin']).optional(),
    search: z.string().trim().optional(),
    sort: z.enum(['id', 'name', 'email']).default('id'),
    order: z.enum(['asc', 'desc']).default('asc')
});

module.exports = {
    createUserSchema,
    updateUserSchema,
    userIdSchema,
    updateUserRoleSchema,
    paginationSchema
}