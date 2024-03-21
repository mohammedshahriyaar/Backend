class ApiResponse{
    constructor(statusCode,data,message="Success"){
        this.statusCode=statusCode,
        this.data=data,
        this.message=message
        this.success= statusCode < 400
    }
}
export {ApiResponse}

//this tells us that any api response follows these standards