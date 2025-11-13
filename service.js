const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const sendEmail = require('./sendingmail/sendemail')
const User = require('./models/user')
const Task = require('./models/task');

const authMidlle = require('./middle_token/authMiddleware')


const router = express.Router();


// === Регистрация ==
router.post('/register',async(req,res)=>{
    try {
    const { username, email, password } = req.body;
      if(!username || !email || !password){
        return res.status(400).json({message: 'Заполните все поле'})
      }


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Пользователь уже существует" });
    }

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаём нового пользователя
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // Отправляем письмо пользователю
    await sendEmail( email, "Регистрация успешна",`Здравствуйте, ${username}! Вы успешно зарегистрировались на сайте!`
    );

    res.status(201).json({ message: "Регистрация успешна, письмо отправлено!" });
  } catch (err) {
    console.error("Ошибка регистрации:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
})

// === Логин ===
router.post('/login',async(req,res)=>{
  try{
    const {email, password } = req.body;
     if(!email || !password){
     return res.status(400).json({message: 'Заполните все поле'})   
     }

    const user = await User.findOne({email})
    if(!user){
   return res.status(400).json({ message: "Пользователь не найден" });    
  }
  const chekpas = await bcrypt.compare(password, user.password)
    if(!chekpas){
    return res.status(400).json({ message: 'Неверный email или пароль' });    
    }
      //Создаём JWT токен
    const token = jwt.sign(
      { id: user._id, email: user.email, date: user.date,}, // данные, которые будут в токене
      process.env.JWT_SECRET,          // секретный ключ
      { expiresIn: '17h' }         // время жизни токена
    );
    res.json({message: 'Успешно',token})
      
  }catch(err){
    res.status(500).json({ message: 'Ошибка сервера', error: err.message }); 
  }
})

//Защищённый маршрут
router.get('/profile', authMidlle, async (req, res) => {
  res.json({
    message: 'Добро пожаловать в профиль!',
    user: req.user, // данные которые были в токене (id, email)
  });
});



// Создать задачу
router.post('/task', authMidlle,async(req,res)=>{
  try{
  const { text } = req.body;
  const task = new Task({text,user: req.user.id})
  await task.save();
  res.status(201).json({ message: 'Задача создана', task });
  }catch(err){
   res.status(500).json({ message: 'Ошибка сервера', error: err.message });   
  }
});


// Получить все задачи пользователя
router.get('/tasks',authMidlle,async(req,res)=>{
  const tasks = await Task.find({user: req.user.id})
  res.json(tasks)
})


// Обновить задачу
router.put('/tasks/:id', authMidlle, async (req, res) => {
  try{
 const { id } = req.params;
  const updated = await Task.findOneAndUpdate(
    { _id: id, user: req.user.id },
    { text: req.body.text, completed: req.body.completed },
    { new: true }
  );
  if (!updated) return res.status(404).json({ message: 'Задача не найдена' });
  res.json({ message: 'Задача обновлена', updated });
  }catch(err){
   res.status(500).json({ message: 'Ошибка сервера', error: err.message }); 
  }
  
});

//удалить задачу
router.delete('/tasks/:id',authMidlle,async(req,res)=>{
  try{
  const {id} = req.params;
  const deleted = await Task.findByIdAndDelete({_id: id, user: req.user.id})
  if (!deleted) return res.status(404).json({ message: 'Задача не найдена' });
  res.json({message: 'Задача удалена'}) 
  
  }catch{
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
})


module.exports = router