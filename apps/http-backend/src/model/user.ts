   import mongoose from "mongoose";
   export interface User{
    id:{
        type: mongoose.Schema.Types.ObjectId;
        ref: 'User';
    },
    name:{
        type: string;
        required: true;
    },
    email:{
        type: string;
        required: true;
    },
    password:{
        type: string;
        required: true;
    }
}

export default User;