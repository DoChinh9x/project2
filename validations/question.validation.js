const Joi = require('joi');
const { objectId } = require('./custom.validation');

class questionValidation {
  createQuestion(data) {
    const schema= Joi.object().keys({
      question: Joi.string().required(),
      answer1: Joi.string().required(),
      answer2: Joi.string().required(),
      answer3: Joi.string().required(),
      answer4: Joi.string().required(),
      correctanswer: Joi.string().required(),
    })
    return schema.validate(data);
  };
  
  submitAnswer(data) {
    const schema=  Joi.array().items(
      Joi.object().keys({
        question: Joi.string().required(),
        correctanswer: Joi.string().required(),
      })
    )
    return schema.validate(data);
  };
  
  getQuestion(data) {
    const schema= Joi.object().keys({
      questionId: Joi.string().custom(objectId),
    })
    return schema.validate(data);
  };
  
  updateQuestion (data) {
    const schema= Joi.object().keys({
      questionId: Joi.required().custom(objectId),
    })
      .keys({
        question: Joi.string().required(),
        answer1: Joi.string().required(),
        answer2: Joi.string().required(),
        answer3: Joi.string().required(),
        answer4: Joi.string().required(),
        correctanswer: Joi.string().required(),
      })
      .min(1)
    return schema.validate(data);
  };
  
  deleteQuestion(data) {
    const schema= Joi.object().keys({
      questionId: Joi.string().custom(objectId),
    })
    return schema.validate(data);
  };
}


module.exports = questionValidation;