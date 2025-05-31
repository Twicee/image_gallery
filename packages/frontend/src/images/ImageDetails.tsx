import { useParams } from "react-router";
import type { IApiImageData } from "../../../backend/src/shared/ApiImageData.ts";
import { ImageNameEditor } from "../ImageNameEditor.tsx";

interface ImageDetailsProps {
    images: IApiImageData[];
    isLoading: boolean;
    hasError: boolean;
    setImageData: React.Dispatch<React.SetStateAction<IApiImageData[]>>;
}

export function ImageDetails({ images, isLoading, hasError, setImageData }: ImageDetailsProps) {
    const { imageId } = useParams();
    const image = images.find(image => image.id === imageId);

    if (isLoading) return <p>Loading image...</p>;
    if (hasError) return <p>Error loading image. Please try again later.</p>;
    if (!image) return <h2>Image not found</h2>;

    const handleNameChange = (newName: string) => {
        setImageData(prev =>
            prev.map(img =>
                img.id === image.id ? { ...img, name: newName } : img
            )
        );
    };

    return (
        <>
            <h2>{image.name}</h2>
            <p>By {image.author.username}</p>
            <ImageNameEditor
                initialValue={image.name}
                imageId={image.id}
                onNameChange={handleNameChange}
            />
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
        </>
    );
}
