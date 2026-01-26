import { Booking, Product, User } from '../../Model/index.js';
import { sendBookingConfirmationEmail } from '../../Utils/emailService.js';

// Get bookings for the currently logged-in user
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.findAll({ 
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ data: bookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
};

// Get bookings for the currently logged-in user by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.status(200).json({ data: booking });
  } catch (error) {
    console.error('Error fetching booking by ID:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};
    
// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const { productId, travelDate, numberOfPeople, specialRequests, userId } = req.body;

    // Validation
    if (!productId) {
      return res.status(400).json({ error: 'Package ID is required' });
    }
    
    if (!travelDate) {
      return res.status(400).json({ error: 'Travel date is required' });
    }

    // Validate travel date is in the future
    const selectedDate = new Date(travelDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return res.status(400).json({ error: 'Travel date must be in the future' });
    }

    if (numberOfPeople && (numberOfPeople < 1 || numberOfPeople > 20)) {
      return res.status(400).json({ error: 'Number of people must be between 1 and 20' });
    }
    
    // Get product details
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Check if product is active
    if (product.status !== 'active') {
      return res.status(400).json({ error: 'This package is currently not available for booking' });
    }

    // Check stock availability
    if (product.stock_quantity < (numberOfPeople || 1)) {
      return res.status(400).json({ error: 'Not enough slots available for this package' });
    }
    
    // Get user details
    const user = await User.findByPk(userId);
    
    const totalPrice = parseFloat(product.price) * (numberOfPeople || 1);
    
    const booking = await Booking.create({
      userId,
      userName: user?.username || 'Guest',
      userEmail: user?.email || '',
      productId,
      packageName: product.name,
      price: totalPrice,
      travelDate,
      numberOfPeople: numberOfPeople || 1,
      specialRequests: specialRequests || '',
      status: 'Pending'
    });

    // Update product stock
    await product.update({
      stock_quantity: product.stock_quantity - (numberOfPeople || 1)
    });

    // Send confirmation email
    try {
      if (user?.email && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        await sendBookingConfirmationEmail(user.email, {
          userName: user.username,
          packageName: product.name,
          travelDate: travelDate,
          numberOfPeople: numberOfPeople || 1,
          price: totalPrice,
          bookingId: booking.id
        });
      }
    } catch (emailError) {
      console.error('Booking confirmation email failed:', emailError);
      // Continue anyway - booking is created
    }
    
    res.status(201).json({ 
      message: 'Booking created successfully! A confirmation email has been sent.', 
      booking: {
        ...booking.toJSON(),
        formattedPrice: `Nrs. ${totalPrice.toLocaleString()}`
      }
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: 'Failed to create booking. Please try again.' });
  }
};

// Get all bookings (admin)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ data: bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') });
    }
    
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // If cancelling, restore stock
    if (status === 'Cancelled' && booking.status !== 'Cancelled') {
      const product = await Product.findByPk(booking.productId);
      if (product) {
        await product.update({
          stock_quantity: product.stock_quantity + booking.numberOfPeople
        });
      }
    }
    
    await booking.update({ status });
    res.status(200).json({ message: 'Booking status updated successfully', booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
};



// Delete booking
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Restore stock if booking was not cancelled
    if (booking.status !== 'Cancelled') {
      const product = await Product.findByPk(booking.productId);
      if (product) {
        await product.update({
          stock_quantity: product.stock_quantity + booking.numberOfPeople
        });
      }
    }
    
    await booking.destroy();
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
};

// Alias exports (must come after all function definitions)
export const updateBookingById = updateBookingStatus;
export const deleteBookingById = deleteBooking;
