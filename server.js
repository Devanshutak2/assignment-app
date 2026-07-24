// POST /api/users - Save User Endpoint
app.post('/api/users', async (req, res) => {
  try {
    const { 
      firstName, lastName, mobileNo, email, 
      street, city, state, country, address, 
      loginId, password 
    } = req.body;

    // Normalize nested or flat address fields
    const finalStreet = street || (address && address.street) || '';
    const finalCity = city || (address && address.city) || '';
    const finalState = state || (address && address.state) || '';
    const finalCountry = country || (address && address.country) || '';

    // Validate Required Fields
    if (!mobileNo || !email || !loginId || !password) {
      return res.status(400).json({ error: 'Mobile, Email, Login ID, and Password are required fields.' });
    }

    // Check duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'This email is already registered. Use a different email.' });
    }

    const newUser = new User({
      mobileNo,
      email,
      street: finalStreet,
      city: finalCity,
      state: finalState,
      country: finalCountry,
      loginId,
      password
    });

    await newUser.save();

    // Socket.io Broadcast
    io.emit('userJoined', newUser);

    return res.status(201).json({ 
      message: 'User saved successfully!', 
      user: newUser 
    });

  } catch (error) {
    console.error('Error saving user to DB:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error saving user.' });
  }
});
