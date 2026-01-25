const mongoose = require('mongoose');

const connectDB = async() =>{
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser : true,
            useUnifiedTopology : true,
        })

        console.log(`MongoBD connected successfully : ${conn.connection.host}`)
    }
    catch(error){
        console.log(`MongoDB connection error : ${error.message}`)
        process.exit(1);
    }
}


mongoose.connection.on('disconnected' ,()=>{
    console.log('MongoDB disconnected');
})

mongoose.connection.on('error' ,(err)=>{
    console.log(`MongoDB error : ${err.message}`);
})

module.exports = connectDB