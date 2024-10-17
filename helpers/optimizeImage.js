import { Jimp } from "jimp"

const optimizeImage = async(imagePath) => {
    const image = await Jimp.read(`${imagePath}`);
    image.resize(250,250);
    return await image.write(`${imagePath}`);
};
export default optimizeImage;