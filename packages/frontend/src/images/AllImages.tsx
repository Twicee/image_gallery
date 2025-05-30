import { ImageGrid } from "./ImageGrid.tsx";
import type { IImageData } from "../MockAppData.ts";

interface AllImageProps{
    images: IImageData[];
}

export function AllImages({ images }: AllImageProps) {
    return (
        <>
            <h2>All Images</h2>
            <ImageGrid images={images} />
        </>
    );
}
