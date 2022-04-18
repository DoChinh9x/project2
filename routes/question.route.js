const express = require('express');
const validate = require('../middlewares/validate');
const {listQuestionsId,submitAnswer,createQuestion,updateQuestion,deleteQuestion,getAllQuestion} = require('../controllers/question.controller');
const {protect,authorize} = require('../middlewares/auth');
const questionValidation = require('../validations/question.validation');
const router = express.Router();

router.get('/',listQuestionsId);
router.post('/submit',protect, validate(questionValidation.submitAnswer), submitAnswer);
router.get('/edit', getAllQuestion);
router.post(
  '/edit',protect,authorize('admin'),
  validate(questionValidation.createQuestion),createQuestion);
router.patch(
  '/edit/:questionId',protect,authorize('admin'),
  validate(questionValidation.updateQuestion),updateQuestion);
router.delete(
  '/edit/:questionId',protect,authorize('admin'),
  validate(questionValidation.deleteQuestion),deleteQuestion);

module.exports = router;