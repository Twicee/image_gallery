import { Collection, MongoClient, ObjectId } from "mongodb";
import type { IApiImageData } from "shared/ApiImageData";

interface IImageDocument {
    id: string;
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
        const authorIds = [...new Set(images.map(img => img.authorId))];
        const users = await this.userCollection
        .find({ id: { $in: authorIds } })
        .toArray();
        
        const userMap = new Map(users.map(user => [user.id, user]));
        return images.map(image => ({
            id: image.id ?? image._id.toString(),
            src: image.src,
            name: image.name,
            author: userMap.get(image.authorId) ?? {
                id: image.authorId,
                username: "unknown"
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
}