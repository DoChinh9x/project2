const advanceResults = (model,populate)=> async(req,res,next)=>{
    let query;
    //copy query;
    const reqQuery = {...req.query};
    //
    //fields to exclude
    const removeFields =['select','sort','page','limit'];

    //Loop over removeFields and delete them form reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    //creat query string
    let queryStr = JSON.stringify(req.query);
    //creat query operator
    queryStr = queryStr.replace(/\b(gt|gte\lt\lte\in)\b/g,match=>`$${match}`);

    //Find recourse
    query = model.find(JSON.parse(queryStr));

    //select fields
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        query =query.select(fields);
    }
    //sort
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query =query.sort(sortBy);
    }else {
        query = query.sort('-createdAt');
    }

    //Pagination
    const page = parseInt(req.query.page,10)||1;
    const limit = parseInt(req.query.limit,10)||10;
    const startIndex =(page -1)*limit;
    const endIndex =page*limit;
    const total = await model.countDocuments();

    query =query.skip(startIndex).limit(limit);

    if(populate){
        query =query.populate(populate);
    }
    //Executing query
    const results = await query;

    //pagination result
    const pagination ={};

    if(endIndex<total){
        pagination.next={
            page:page+1,
            limit
        }
    }

    if(startIndex>0){
        pagination.prev ={
            page:page-1,
            limit
        }
    }

    res.advanceResults = {
        success:true,
        count : results.length,
        pagination,
        data:results
    }
    next();
};

module.exports = advanceResults;