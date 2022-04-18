
const Question = require('../models/question.model');
const ErrorResponse = require("../utils/errorResponse");


exports.createQuestion = async (questionBody) => {
        return Question.create(questionBody);
      },
    
exports.getQuestionById = async (id) => {
        return Question.findById(id);
      },
    
exports.updateQuestionById = async (questionId, updateBody) => {
        const question = await  Question.findById(questionId);
        if (!question) {
            throw new ErrorResponse('Question not found',404);
        }
        Object.assign(question, updateBody);
        await question.save();
        return question;
      },
    
exports.deleteQuestionById = async (questionId) => {
        const question = await  Question.findById(questionId);
        if (!question) {
          throw new ErrorResponse('Question not found',404);
        }
        await question.remove();
        return question;
      },
    
exports.queryQuestions = async (filter, options) => {
        const exclude = { correctanswer: 0 };
        const questions = await Question.paginate(filter, options, exclude);
        return questions;
      },
      
exports.getQuestionByListId = async (listId) => {
        const listQuestion = await Question.find({ question: { $in: listId } })
          .select('question')
          .select('correctanswer');
        return listQuestion;
      },
      
exports.getAllQuestion = async () => {
        return Question.find();
      }