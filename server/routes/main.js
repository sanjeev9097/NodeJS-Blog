const express = require('express');

const router = express.Router();
const Post = require('../models/Post')


// FETCH ALL DATA AND REFLECT TO THE HOME PAGE AND THIS IS THE GET REQUEST

router.get("/", async(req, res) => {
    const locals = {
        title : "NodeJs Blog",
        description : "Simple Blog Created with NodeJs, Express & MongoDB."
    }
    try {
        const locals = {
          title: "NodeJs Blog",
          description: "Simple Blog created with NodeJs, Express & MongoDb."
        }
    
        let perPage = 5;
        let page = req.query.page || 1;
    
        const data = await Post.aggregate([ { $sort: { createdAt: -1 } } ])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();
    
        // Count is deprecated - please use countDocuments
        // const count = await Post.count();
        const count = await Post.countDocuments({});
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);
    
        res.render('index', { 
          locals,
          data,
          current: page,
          nextPage: hasNextPage ? nextPage : null,
          currentRoute: '/'
        });
    
      } catch (error) {
        console.log(error);
      }
})

// FETCH THE SINGLE DATA AND THIS IS THE GET REQUEST

router.get("/posts/:id", async(req, res) => {
    
    try {

        const slug = req.params.id;

        

        const data = await Post.findById({ _id : slug });

        const locals = {
            title : data.title,
            description : "Simple Blog Created with NodeJs, Express & MongoDB."
        }
        //console.log(data);
        res.render('post', { locals, data });
    } catch (error) {
        console.log(error);
    }
})

router.post("/search", async(req, res) => {
    const locals = {
        title : "NodeJs Blog",
        description : "Simple Blog Created with NodeJs, Express & MongoDB."
    }
    try {
        let searchTerm = req.body.searchTerm;
        
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g,"");
        const data = await Post.find({
            $or: [
                { title: { $regex : new RegExp(searchNoSpecialChar, 'i')} },
                { body: { $regex : new RegExp(searchNoSpecialChar, 'i')} }
            ]
        });
        // Above  code is designed to perform a case-insensitive search in the MongoDB Post collection based on a sanitized version of the search term, 
        // removing special characters from it. It looks for matches in both the title and body fields using a regular expression.

        res.render("search", {
            data,
            locals
        })
    } catch (error) {
        console.log(error);
    }
})

router.get('/about', (req, res) => {
    const title = "About page";
    res.render('about', {title});
});

router.get('/contact-us', (req, res) => {
    const title = "Conatact-Us Page";
    res.render('contact-us', {title});
});


module.exports = router; 


// router.get("/", async(req, res) => {
//     const locals = {
//         title : "NodeJs Blog",
//         description : "Simple Blog Created with NodeJs, Express & MongoDB."
//     }
//     try {
//         const data = await Post.find();
//         console.log(data);
//         res.render('index', { locals, data });
//     } catch (error) {
//         console.log(error);
//     }
// })