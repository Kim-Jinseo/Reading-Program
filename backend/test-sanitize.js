import mongoSanitize from 'express-mongo-sanitize';

const obj = { username: { $ne: null } };
console.log("Before:", obj);
mongoSanitize.sanitize(obj);
console.log("After:", obj);
