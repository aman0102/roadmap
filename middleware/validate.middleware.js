const AppError = require('../utils/AppError');
const validate = (schema, source = 'body')=>{
    return (req, res, next)=>{
        // Validate the request body against the provided schema
        const result = schema.safeParse(req[source]);
        if(!result.success){
            return next(new AppError('Validation failed', 400, result.error.issues));
        }
        // If validation is successful, replace the request body with the validated data
        req[source] = result.data;
        next();
    };
};
module.exports = {
    validate
}
