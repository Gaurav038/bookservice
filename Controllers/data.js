const express = require("express");
const router = express.Router()
const Seat = require("../models/seats")
const Pricing = require("../models/price")
const Booking = require("../models/booking")

async function getSeatPricing(className) {

    const totalSeats = await Seat.countDocuments({ seat_class: className });
    const bookedSeats = await Seat.countDocuments({ seat_class: className, isBooked: true });
    
    console.log(bookedSeats, totalSeats);
    const percentageBooked = (bookedSeats / totalSeats) * 100;
    
    const priceDetail = await Pricing.findOne({seat_class: className});
  
    if (percentageBooked < 40) {
      return priceDetail.min_price
                ? priceDetail.min_price 
                : priceDetail.normal_price
                   
    } 
    else if (percentageBooked >= 40 && percentageBooked <= 60) {
      return priceDetail.normal_price 
                ? priceDetail.normal_price 
                : priceDetail. max_price
    } else {
      return priceDetail. max_price ? priceDetail. max_price : priceDetail.normal_price;
    }
}

router.get('/booking', async(req, res) => {

    const {phoneNumber } = req.query;

    try {
        const data = await Booking.find({phoneNumber})
        if (!data) {
            return res.status(404).json({ error: 'user not found' });
          }
        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error});
    }
})

router.get('/:id', async (req, res) => {

    const seatId = req.params.id;
  
    try {
      const seat = await Seat.findOne({id: parseInt(seatId)}).lean();
  
      if (!seat) {
        return res.status(404).json({ error: 'Seat not found' });
      }
  
      const className = seat.seat_class;
      
      const seatPricing = await getSeatPricing(className);
      
      const priceDetail = await Pricing.findOne({seat_class: className});

      const seatDetails = {
        id: seat.id,
        identifier: seat.seat_identifier,
        is_booked: seat.isBooked ? seat.isBooked : "false",
        pricing: seatPricing,
        class: seat.seat_class,
        priceDetail
      };
  
      res.status(200).json(seatDetails);
    } catch (error) {
      res.status(500).json({ error});
    }
  });
  
router.get('/', async(req, res) => {

    try {
        const data = await Seat.find({}).lean().sort({ seat_class: 1 }).exec();

        const formattedSeats = data.map(seat => ({
            id: seat.id,
            identifier: seat.seat_identifier,
            is_booked: seat.isBooked ? seat.isBooked : "false",
            class: seat.seat_class
          }));

        res.status(200).json({data: formattedSeats})
    } catch (error) {
        res.status(500).json({ error});
    }
})


router.post('/booking', async (req, res) => {
    const { seatIds, name, phoneNumber } = req.body;

    try {
        // Check if any of the seats are already booked
        const bookedSeats = await Seat.find({ id: { $in: seatIds }, isBooked: true }).lean()
        if (bookedSeats.length > 0) {
            return res.status(400).json({ error: 'Seats are already booked' });
        }

        // Fetch the seat details for all selected seats
        const seats = await Seat.find({id: { $in: seatIds } }).lean()

        console.log(seats);
        // Calculate the total amount for the booking based on seat classes
        let totalAmount = 0;
        for (const seat of seats) {
            const seatClass = seat.seat_class;
            const seatPricing = await getSeatPricing(seatClass);
            console.log(seatPricing);
            totalAmount += parseInt(seatPricing.replace('$', ''));
        };

        // Create a new booking
        const booking = new Booking({
            seatIds,
            name,
            phoneNumber,
            totalAmount
        });
        await booking.save();

        // Update the isBooked field for the booked seats
        await Seat.updateMany({ id: { $in: seatIds } }, { isBooked: true }).lean();

        res.status(200).json({ bookingId: booking._id, totalAmount });
    } catch (error) {
        res.status(500).json({ error});
    }

})


module.exports = router;
