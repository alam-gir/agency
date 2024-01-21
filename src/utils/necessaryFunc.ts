const isBdPhone = (value : string) => {
    const bangladeshiNumber = /^(?:\+88|88)?(?:01[3-9]\d{8})$/;
    return bangladeshiNumber.test(value);
}


const isRole = (value : string) => {
    return value === "user" ||value === "admin" || value === "super-admin";
}
export {
    isBdPhone, isRole
}