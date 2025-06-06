import { Collection, MongoClient, ObjectId } from "mongodb";
import type { IApiImageData } from "shared/ApiImageData";

interface IImageDocument {
    id?: string;
    src: string;
    name: string;
    authorId: string;
}

interface IUserDocument {
    id: string;
    username: string;
}


export class ImageProvider {
    private imageCollection: Collection<IImageDocument>;
    private userCollection: Collection<IUserDocument>;
    

    constructor(private readonly mongoClient: MongoClient) {
        const imageCollectionName = process.env.IMAGES_COLLECTION_NAME;
        const userCollectionName = process.env.USERS_COLLECTION_NAME;
        if (!imageCollectionName || !userCollectionName) {
            throw new Error("Missing collection names in environment variables");
        }

        const db = this.mongoClient.db();
        this.imageCollection = db.collection(imageCollectionName);
        this.userCollection = db.collection(userCollectionName);
    }

    async getImages(nameFilter?: string): Promise<IApiImageData[]> {
        const filter = nameFilter
        ? { name: { $regex: nameFilter, $options: "i" } }
        : {};
        const images = await this.imageCollection.find(filter).toArray();
        return images.map(image => ({
            id: image.id ?? image._id.toString(),
            src: image.src,
            name: image.name,
            author: {
                id: image.authorId,
                username: image.authorId, 
                email: "fake@example.com"
            }
        }));
    }

    async updateImageName(imageId: string, newName: string): Promise<number> {
        if (!ObjectId.isValid(imageId)) {
            return 0;
        }
        const result = await this.imageCollection.updateOne(
            { _id: new ObjectId(imageId) },
            { $set: { name: newName } }
        );
        return result.matchedCount;
    }

    async getImageById(imageId: string) {
        return await this.imageCollection.findOne({ _id: new ObjectId(imageId) });
    }

    async createImage(data: { name: string; src: string; authorId: string }): Promise<void> {
        await this.imageCollection.insertOne({
            name: data.name,
            src: data.src,
            authorId: data.authorId
        });
    }
}