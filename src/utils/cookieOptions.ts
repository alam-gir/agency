const cookieOptions = (expiresInSec : number,maxAgeInSec: number, secure:boolean = true, httpOnly:boolean = true, sameSite : boolean = true) => {
    return {
        expires: new Date(Date.now() + 1000  * expiresInSec),
        maxAge: maxAgeInSec * 1000,
        secure: secure,
        httpOnly: httpOnly,
        sameSite: sameSite
    }
}

export {cookieOptions}