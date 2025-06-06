import express, { Request, Response } from "express";
import { ImageProvider } from "../ImageProvider";
import { ObjectId } from "mongodb";
import { imageMiddlewareFactory, handleImageFileErrors } from "../middleware/imageUploadMiddleware";

function waitDuration(numMs: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, numMs));
}

export function uploadHandler(imageProvider: ImageProvider): express.RequestHandler {
  return async (req, res) => {
    const file = req.file;
    const name = req.body?.name;

    if (!file || typeof name !== "string") {
      res.status(400).send({
        error: "Bad Request",
        message: "Missing file or image name",
      });
      return;
    }

    const authorId = req.user?.username;
    if (!authorId) {
      res.status(401).send({
        error: "Unauthorized",
        message: "Missing authentication",
      });
      return;
    }

    const src = `/uploads/${file.filename}`;

    try {
      await imageProvider.createImage({ name, src, authorId });
      res.status(201).send();
    } catch (err) {
      console.error("Failed to save image metadata:", err);
      res.status(500).send({
        error: "Internal Server Error",
        message: "Could not save image metadata",
      });
    }
  };
}

export function registerImageRoutes(app: express.Application, imageProvider: ImageProvider) {
    app.get("/api/images", async (req: Request, res: Response) => {
        await waitDuration(1000);
        try {
            const images = await imageProvider.getImages();
            res.json(images);
        } catch (err) {
            console.error("Failed to fetch images:", err);
            res.status(500).json({ error: "Could not fetch images" });
        }
    });

    app.get("/api/images/search", (req: Request, res: Response) => {
        void (async () => {
            const nameQuery = req.query.name;

            if (typeof nameQuery !== "string") {
                return res.status(400).json({ error: "Missing or invalid 'name' query parameter" });
            }

            try {
                const results = await imageProvider.getImages(nameQuery);
                res.json(results);
            } catch (err) {
                console.error("Failed to search images:", err);
                res.status(500).json({ error: "Could not search images" });
            }
        })();
    });

    app.patch("/api/images/:id", (req: Request, res: Response) => {
        void (async () => {
            const imageId = req.params.id;
            const newName = req.body?.name;
            const MAX_NAME_LENGTH = 100;

            if (typeof newName !== "string") {
                return res.status(400).send({
                    error: "Bad Request",
                    message: "Missing or invalid 'name' in request body"
                });
            }
            if (newName.length > MAX_NAME_LENGTH) {
                return res.status(422).send({
                    error: "Unprocessable Entity",
                    message: `Image name exceeds ${MAX_NAME_LENGTH} characters`
                });
            }
            if (!ObjectId.isValid(imageId)) {
                return res.status(404).send({
                    error: "Not Found",
                    message: "Image does not exist"
                });
            }
            const image = await imageProvider.getImageById(imageId);
            if (!image) {
                return res.status(404).send({
                    error: "Not Found",
                    message: "Image does not exist"
                });
            }

            if (image.authorId !== req.user?.username) {
                return res.status(403).send({
                    error: "Forbidden",
                    message: "Only the image owner can rename this image"
                });
            }

            const updated = await imageProvider.updateImageName(imageId, newName);
            if (updated === 0) {
                return res.status(404).send({
                    error: "Not Found",
                    message: "Image does not exist"
                });
            }
            res.status(204).send();
        })();
    });

    app.post(
        "/api/images",
        imageMiddlewareFactory.single("image"),
        handleImageFileErrors,
        uploadHandler(imageProvider),
    );
}
