var mongoose = require('mongoose');

mongoose.set('strictQuery', true);
mongoose.connect(process.env.DB_CONN_STRING,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    
}).then(()=>{
    console.log('Database connected!')
}).catch((err)=>{
    console.log(err);
})




