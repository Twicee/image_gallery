import { useState } from "react";

interface INameEditorProps {
    initialValue: string;
    imageId: string;
    authToken: string;
    onNameChange: (newName: string) => void;
}

export function ImageNameEditor(props: INameEditorProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [input, setInput] = useState(props.initialValue);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmitPressed() {
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await fetch(`/api/images/${props.imageId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${props.authToken}`
                },
                body: JSON.stringify({ name: input })
            });

            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error("Bad request: name is missing or invalid.");
                } else if (response.status === 404) {
                    throw new Error("Image not found.");
                } else if (response.status === 422) {
                    throw new Error("Image name is too long.");
                } else {
                    throw new Error("Request failed");
                }
            }

            props.onNameChange(input);
            setIsEditingName(false);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isEditingName) {
        return (
            <div style={{ margin: "1em 0" }}>
                <label>
                    New Name{" "}
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isSubmitting}
                    />
                </label>
                <button
                    disabled={input.length === 0 || isSubmitting}
                    onClick={handleSubmitPressed}
                >
                    Submit
                </button>
                <button onClick={() => setIsEditingName(false)} disabled={isSubmitting}>
                    Cancel
                </button>
                {isSubmitting && <p>Working...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
        );
    } else {
        return (
            <div style={{ margin: "1em 0" }}>
                <button onClick={() => setIsEditingName(true)}>Edit name</button>
            </div>
        );
    }
}
