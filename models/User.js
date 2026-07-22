const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: [true, 'First name is required'] 
  },
  lastName: { 
    type: String, 
    required: [true, 'Last name is required'] 
  },
  mobileNo: { 
    type: String, 
    required: true, 
    match: [/^\d{10}$/, 'Mobile number must be exactly 10 digits'] 
  },
  email: { 
    type: String, 
    required: true, 
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'] 
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String
  },
  loginId: { 
    type: String, 
    required: true, 
    match: [/^[a-zA-Z0-9]{8}$/, 'Login ID must be exactly 8 alphanumeric characters'] 
  },
  password: { 
    type: String, 
    required: true, 
    // Requires min 6 chars, 1 uppercase, 1 lowercase, and 1 special character
    match: [
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/, 
      'Password must be at least 6 characters with 1 upper case, 1 lower case, and 1 special character'
    ] 
  }
}, {
  timestamps: { createdAt: 'creationTime', updatedAt: 'lastUpdatedOn' }
});

module.exports = mongoose.model('User', userSchema);