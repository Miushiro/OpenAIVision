import FileSystem from 'fs';
import sharp from 'sharp';

export function CreateImageDataURLFromFilePath(filepath:string, mimeType:string): string {
    const imageData = FileSystem.readFileSync(filepath);
    const base64Data = imageData.toString('base64');
    return `data:${mimeType};base64,${base64Data}`;
}

export async function CreateImageDataURLFromFile(File: File, mimeType:string): Promise<string> {
    const buffer = Buffer.from(await File.arrayBuffer());
    const base64Data = buffer.toString('base64');
    return `data:${mimeType};base64,${base64Data}`;
}

export async function CreateImageDataURLFromBuffer(buffer: Buffer, mimeType: string): Promise<string> {
    const base64Data = buffer.toString('base64');
    return `data:${mimeType};base64,${base64Data}`;
}

export async function CheckImageSize_1024p(image: File): Promise<Buffer> {
    if(image.size > 5 * 1024 * 1024) {
        throw new Error('File size exceeds the 5MB limit. Please upload a smaller image.');
    }
    const {data, info} = await sharp(await image.arrayBuffer())
        .resize(1024, 1024, {
            fit: 'inside',
            withoutEnlargement: true
        })
        .toBuffer({resolveWithObject: true});
    return data;
}