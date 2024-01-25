const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin'
const jwtSecret = process.env.JWT_SECRET;


// Check Authentication

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json( { message : 'Unauthorized' } );
    }

    try {
        const decode = jwt.verify(token, jwtSecret);
        req.userId = decode.userId;
        next();
    } catch (error) {
        return res.status(401).json( { message : 'Unauthorized' } );
    }
}

// Admin Dahboard

router.get('/dashboard', authMiddleware, async(req, res) => {
    try {
        const locals = {
            title: "Admin",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }

        const data = await Post.find();
        res.render('admin/dashboard', { locals, data })
    } catch (error) {
        console.log(error);
    }
    
})


router.get('/admin', async (req, res) => {
    try {
      const locals = {
        title: "Admin",
        description: "Simple Blog created with NodeJs, Express & MongoDb."
      }
  
      res.render('admin/index', { locals, layout: adminLayout });
    } catch (error) {
      console.log(error);
    }
  });

// Admin login Page
router.post("/admin", async(req, res) => {
    
    try {
        const { username, password } = req.body;
        const user = await User.findOne( { username } );

        if(!user){
            return res.status(401).json({ message: ' Inavlid credientials ' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            return res.status(401).json({ message: ' Inavlid credientials ' });
        }

        const token = jwt.sign({userId : user._id}, jwtSecret);
        res.cookie('token', token, { httpOnly: true })
        res.redirect('/dashboard')

    } catch (error) {
        console.log(error);
    }
});


// Login Data


router.post('/register', async (req, res) => {
    try{
        const { username, password } = await req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        try{
            const user = await User.create( { username, password : hashedPassword } );
            res.status(201).json({message: 'User Created', user})
        }catch(error){
            if(error.code === 11000){
                res.status(409).json({message : 'User already in use'});
            }
            res.status(500).json({message : 'internal server error'});
        }
    }catch(err){
        console.log(err);
    }
})

// Getting Post Form
router.get('/add-post', (req, res) => {
    res.render('admin/add-post');
})


// Adding the posts form
router.post('/add-post', async (req, res) => {
    try{
        const data = req.body;
        const post = await Post.create(data);
        //console.log('Post added:', post);
        res.redirect('/dashboard');
    }catch(err){
        console.log(err);
    }
    
})


// Edit page 

router.get('/edit-post/:id', async(req, res) => {
    const slug = req.params.id;
    const data = await Post.findById(slug)
    res.render('admin/edit-post', { data });
})

// Updated post

router.put('/edit-post/:id', async (req, res) => {
    try{
        await Post.findByIdAndUpdate(req.params.id, {
            title : req.body.title,
            body : req.body.body,
            updatedAt : Date.now()
        });
        res.redirect(`/edit-post/${req.params.id}`);
    }catch(err){
        console.log(err);
    }
    
})

// Delete the data

router.delete('/delete-post/:id', async(req, res) => {
    const slug = req.params.id;

    await Post.findByIdAndDelete(slug);
    res.redirect('/dashboard');

})

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
})


module.exports = router;