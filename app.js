import express from 'express';
import helmet from 'helmet';
import userRoutes from './routes/users.js';



const app = express();


app.use(helmet());


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use(express.urlencoded({ extended: true }))
app.use(express.json());  


app.use('/pictures', express.static('pictures'));
app.use('/api/auth', userRoutes);


export default app;