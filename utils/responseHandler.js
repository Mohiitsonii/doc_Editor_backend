// Success Response Handler
export const successHandler = (res, message, data, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

// Error Response Handler
export const errorHandler = (res, message, error, statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        message,
        error: error.message || error,
    });
};
