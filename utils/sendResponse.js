function sendResponse(res , statusCode , message , data = null){
    return res.status(statusCode).json({
        success : true,
        statusCode,
        message,
        data : data ?? null
    })
}   

module.exports = sendResponse;