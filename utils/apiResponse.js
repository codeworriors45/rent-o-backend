var httpStatusCode = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER: 500
};

var apiResponse = {
    success: (res, data = {}, status_code = httpStatusCode.OK,  message = "Request process successfully",) => {
        res.setHeader("Content-Type", "application/json");
        return res.status(data?.status_code ?? status_code).json({success:true, status_code:status_code, message:message, data});
    },

    successWithExtra: (res, data = {}, status_code = httpStatusCode.OK,  message = "Request process successfully", rest) => {
        res.setHeader("Content-Type", "application/json");
        return res.status(data?.status_code ?? status_code).json({success:true, status_code:status_code, message:message, data, ...rest});
    },


    error: (res, status_code = httpStatusCode.BAD_REQUEST,  message = "Something went wrong!") => {
        res.setHeader("Content-Type", "application/json");
        return res.status(status_code).json({success:false, status_code:status_code, message:message});
    },

    errorWithData: (res, data = null, status_code = httpStatusCode.BAD_REQUEST,  message = "Something went wrong!") => {
        res.setHeader("Content-Type", "application/json");
        return res.status(data?.status_code ?? status_code).json({success:false, status_code:status_code, message:message, error: data});
    },

};

global.httpStatusCode = httpStatusCode;
global.apiResponse = apiResponse;
