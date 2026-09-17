import mongoose from "mongoose"

const userschema = new mongoose.Schema({
   username: {
      type: String,
      unique: [true, 'Username already taken'],
      require: true
   },
   email: {
      type: String,
      unique: [true, 'Account Already Exist'],
      require: true
   },
   password: {
      type: String,
      require: true
   },

},
   { timestamps: true }
)

const User = mongoose.model('User', userschema)

export default User