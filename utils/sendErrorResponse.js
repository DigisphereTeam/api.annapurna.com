function sendErroResponse(res , statusCode , message){
    return res.status(statusCode).json({
        success : false,
        statusCode,
        message
    })
}   

module.exports = sendErroResponse;