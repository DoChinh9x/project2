const  {getQuestionByListId,queryQuestions,getAllQuestion,
updateQuestionById,deleteQuestionById,createQuestion}  = require('../services/question.service');
const pick = require('../utils/pick');
const asyncHandler = require('../middlewares/async');


exports.submitAnswer = asyncHandler((async (req, res) => {
        const listQues = [req.body].map((element) => element.question);
        const listQuestions = await getQuestionByListId(listQues);
        const results = listQuestions.map((e) => {
          let elementResult;
          [req.body].forEach((questionElement, index, arr) => {
            if (questionElement.question === e.question) {
              if (questionElement.correctanswer === e.correctanswer) elementResult = { result: true, ...arr[index] };
              else elementResult = { result: false, ...arr[index] };
            }
          });
          return elementResult;
        });
        res.json(results);
      }));
      
exports.listQuestionsId= asyncHandler((async (req, res) => {
        const filter = pick(req.query, ['_id', 'question', 'answer1', 'answer2', 'answer3', 'answer4']);
        const options = pick(req.query, ['sortBy', 'limit', 'page']);
        const result = await queryQuestions(filter, options);
        res.send(result);
      }));
      
exports.getAllQuestion = asyncHandler((async (req, res) => {
        const result = await getAllQuestion();
        res.send(result);
      }));
      
exports.updateQuestion = asyncHandler((async (req, res) => {
        const question = await updateQuestionById(req.params.questionId, req.body);
        res.send(question);
      }));
      
exports.createQuestion = asyncHandler((async (req, res) => {
        const question = await createQuestion(req.body);
        res.send(question);
      }));
      
exports.deleteQuestion = asyncHandler((async (req, res) => {
        const question = await deleteQuestionById(req.params.questionId);
        res.send(question);
      }));


