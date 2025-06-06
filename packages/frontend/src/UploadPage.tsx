import { useActionState, useId, useState } from "react";

interface UploadPageProps {
    authToken: string;
}

function readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.readAsDataURL(file);
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = (err) => reject(err);
    });
}

export function UploadPage({ authToken }: UploadPageProps) {
    const fileInputId = useId();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [result, handleUploadSubmit, isPending] = useActionState(
        async (_prevState: unknown, formData: FormData) => {
            try {
                const response = await fetch("/api/images", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: formData,
                });

                if (!response.ok) {
                    const data = await response.json().catch(() => ({}));
                    return data.message || "Upload failed.";
                }

                return "Upload successful!";
            } catch (err) {
                return "Server error.";
            }
        },
        null
    );

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            const dataUrl = await readAsDataURL(file);
            setPreviewUrl(dataUrl);
        } else {
            setPreviewUrl(null);
        }
    }

    return (
        <>
            <h2>Upload</h2>
            <form action={handleUploadSubmit}>
                <div>
                    <label htmlFor={fileInputId}>Choose image to upload:</label>
                    <input
                        id={fileInputId}
                        name="image"
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        onChange={handleFileChange}
                        required
                        disabled={isPending}
                    />
                </div>

                <div>
                    <label>
                        <span>Image title: </span>
                        <input name="name" required disabled={isPending} />
                    </label>
                </div>

                {previewUrl && (
                    <div>
                        <img
                            style={{ width: "20em", maxWidth: "100%" }}
                            src={previewUrl}
                            alt="Preview"
                        />
                    </div>
                )}

                <input type="submit" value="Confirm upload" disabled={isPending} />

                {result && (
                    <p style={{ color: result.includes("successful") ? "green" : "red" }} aria-live="polite">
                        {result}
                    </p>
                )}
            </form>
        </>
    );
}
