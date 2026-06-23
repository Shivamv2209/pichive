import heicConvert from "heic-convert"

export const convertHeicToJpeg = async (buffer)=>{
    return await heicConvert({
        buffer,
        format:"JPEG",
        quality:0.9
    });
}