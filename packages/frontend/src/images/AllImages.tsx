import { ImageGrid } from "./ImageGrid.tsx";
import type { IApiImageData } from "../../../backend/src/shared/ApiImageData.ts";

interface AllImagesProps {
    images: IApiImageData[];
    isLoading: boolean;
    hasError: boolean;
    searchPanel: React.ReactNode
}

export function AllImages({ images, isLoading, hasError, searchPanel }: AllImagesProps) {
    if (isLoading) return <p>Loading images...</p>;
    if (hasError) return <p>Error loading images. Please try again later.</p>;

    return (
        <>
            <h2>All Images</h2>
            {searchPanel}
            <ImageGrid images={images} />
        </>
    );
}
