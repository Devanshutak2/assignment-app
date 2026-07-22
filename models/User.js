const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: [true, 'First name is required'],
    match: [/^[a-zA-Z\s]+$/, 'First name can only contain letters']
  },
  lastName: { 
    type: String, 
    required: [true, 'Last name is required'],
    match: [/^[a-zA-Z\s]+$/, 'Last name can only contain letters']
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
    city: {
      type: String,
      match: [/^[a-zA-Z\s]*$/, 'City can only contain letters']
    },
    state: {
      type: String,
      match: [/^[a-zA-Z\s]*$/, 'State can only contain letters']
    },
    country: {
      type: String,
      match: [/^[a-zA-Z\s]*$/, 'Country can only contain letters']
    }
  },
  loginId: { 
    type: String, 
    required: true, 
    match: [/^[a-zA-Z0-9]{8}$/, 'Login ID must be exactly 8 alphanumeric characters'] 
  },
  password: { 
    type: String, 
    required: true, 
    match: [
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/, 
      'Password must be at least 6 characters with 1 upper case, 1 lower case, and 1 special character'
    ] 
  }
}, {
  timestamps: { createdAt: 'creationTime', updatedAt: 'lastUpdatedOn' }
});

module.exports = mongoose.model('User', userSchema);
