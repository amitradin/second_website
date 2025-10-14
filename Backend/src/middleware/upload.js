import multer from 'multer';
import {GridFSBucket} from 'mongodb'
import mongoose from 'mongoose';

let bucket;
mongoose.connection.on('connected', () => {
    bucket = new GridFSBucket(mongoose.connection.db , {
        bucketName: 'taskFiles'
    })
})


const storage  = multer.memoryStorage()

const fileFilter = (req, file, cb) =>{
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/;
    const extname = allowedTypes.test(file.originalname.toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
        return cb(null,true)

    }
    else { cb(new Error ('The file uploaded is not allowed'))}

}
const upload  = multer({
    storage: storage,
    limits:{
        fileSize: 10*1024*1024 // 10MB
    },
    fileFilter: fileFilter
})

export {bucket}
export default upload