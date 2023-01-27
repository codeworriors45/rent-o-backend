const { Op } = require('sequelize');
const Validator = require('validatorjs');
const db = require('../../../../models');
const { getOneByKeys } = require('../../../../utils/helpers/dbCommon');

const bookingController = {

    index: async (req, res, next) => {
        try {
            const { propertyId } = req.params;

            if (propertyId == null || propertyId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "PropertyId can't be empty!"
                );
            }

            const booking = await db.Booking.findAll({
                where: {
                    propertyId,
                    deletedAt: {
                        [Op.is]: null,
                    },
                },
                include: [
                    {
                        model: db.Property,
                        where: {
                          deletedAt: {
                            [Op.is]: null,
                          },
                        }
                    },
                    {
                        model: db.User,
                        where: {
                            deletedAt: {
                              [Op.is]: null,
                            },
                        }
                    }
                ],
            });

            if (booking == null || booking.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "No property booking found."
                );
            }

            return apiResponse.success(res, booking);
        } catch (error) {
            console.log(error);
            return apiResponse.error(
                res,
                httpStatusCode.INTERNAL_SERVER,
                error
            );
        }
    },
    store: async (req, res, next) => {
        let rules = {
            userId: "required|integer",
            price: "required|numeric",
            startedAt: "required|date",
            endAt: "date",

        };

        try {
            const { propertyId } = req.params;

            if (propertyId == null || propertyId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "PropertyId can't be empty!"
                );
            }

            const validation = new Validator(req.body, rules);
            if (validation.fails()) {
                return apiResponse.errorWithData(
                    res,
                    validation.errors.all(),
                    httpStatusCode.UNPROCESSABLE,
                    "Validation Error"
                );
            }

            const { 
                userId,
                price,
                startedAt,
                endAt 
            } = req.body;

            const user= await getOneByKeys(db.User, {
                id: userId,
            });

            if (!user) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "User not found with specific id."
                );
            }

            const booking = await getOneByKeys(db.Booking, {
                userId: userId,
                propertyId: propertyId,
            });

            if (booking) {
                return apiResponse.error(
                    res,
                    httpStatusCode.BAD_REQUEST,
                    `Property booking already exists`
                );
            }

            const newBooking = await db.Booking.create({
                propertyId,
                userId,
                price,
                startedAt,
                endAt  
            });

            if (!newBooking || newBooking?.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.UNPROCESSABLE,
                    `New booking information is not created.`
                );
            }

            return apiResponse.success(
                res,
                newBooking,
                httpStatusCode.CREATED
            );
        } 
        catch (error) {
            console.log(error);
            return apiResponse.error(
                res,
                httpStatusCode.INTERNAL_SERVER,
                error
            );
        }
    },
    show: async (req, res, next) => {
        try {
            const { bookingId } = req.params;

            if (bookingId == null || bookingId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Id can't be empty!"
                );
            }

            const booking = await db.Booking.findOne({
                where: {
                    id: bookingId,
                    deletedAt: {
                        [Op.is]: null,
                    },
                },
                include: [
                    {
                        model: db.Property,
                        where: {
                          deletedAt: {
                            [Op.is]: null,
                          },
                        },
                    },
                    {
                        model: db.User,
                        where: {
                            deletedAt: {
                              [Op.is]: null,
                            },
                        },
                    }
                ],
            });

            if (!booking) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Booking information not found with specific id."
                );
            }

            return apiResponse.success(
                res,
                booking,
                httpStatusCode.OK,
                "Booking information found successfully."
            );
        } catch (error) {
            console.log(error);
            return apiResponse.error(
                res,
                httpStatusCode.INTERNAL_SERVER,
                error
            );
        }
    },
    update: async (req, res, next) => {
        let rules = {
            userId: "required|integer",
            price: "required|numeric",
            startedAt: "required|date",
            endAt: "date",
        };

        try {
            const validation = new Validator(req.body, rules);
            if (validation.fails()) {
                return apiResponse.errorWithData(
                    res,
                    validation.errors.all(),
                    httpStatusCode.UNPROCESSABLE,
                    "Validation Error"
                );
            }

            const { 
                userId,
                price,
                startedAt,
                endAt 
            } = req.body;

            const { bookingId } = req.params;

            if (bookingId == null || bookingId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Id can't be empty!"
                );
            }

            const booking = await getOneByKeys(db.Booking, {
                id: bookingId,
            });

            if (!booking) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Booking not found with specific id."
                );
            }

            const user= await getOneByKeys(db.User, {
                id: userId,
            });

            if (!user) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "User not found with specific id."
                );
            }

            booking.userId = userId,
            booking.price = price, 
            booking.startedAt = startedAt, 
            booking.endendAt =endAt, 
            await booking.save();

            return apiResponse.success(res, booking);
        } catch (error) {
            console.log(error);
            return apiResponse.error(
                res,
                httpStatusCode.INTERNAL_SERVER,
                error
            );
        }
    },
    destroy: async (req, res, next) => {
        try {
            const { bookingId } = req.params;

            if (bookingId == null || bookingId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Id can't be empty!"
                );
            }

            const booking = await getOneByKeys(db.Booking, {
                id: bookingId,
            });
            if (!booking) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Booking not found with specific id."
                );
            }

            booking.deletedAt = new Date();
            await booking.save();

            return apiResponse.success(res, booking);
        } catch (error) {
            console.log(error);
            return apiResponse.error(
                res,
                httpStatusCode.INTERNAL_SERVER,
                error
            );
        }
    },
}

module.exports = bookingController;