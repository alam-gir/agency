class ApiError extends Error  {
    public statusCode : number;
    constructor( statusCode : number, message: string){
        super(message);
        this.statusCode = statusCode;
        
        Object.defineProperty(this, "message",{
            value: message,
            enumerable: true,
            writable: true,
            configurable: true
        })
    }

    
}

export {ApiError}