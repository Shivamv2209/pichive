export const getId = (url) =>{
    const match = url.match(/folders\/([a-zA-z0-9_-]+)/);
    return match ? match[1]:null
}