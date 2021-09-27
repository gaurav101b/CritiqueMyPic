const Joi = require('joi');

module.exports.postSchema = Joi.object({
    post: Joi.object({
        title: Joi.string().required(),
        image: Joi.string().required(),
        info: Joi.string().required(),
        description: Joi.string().required()
    }).required()
})