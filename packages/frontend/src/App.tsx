import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { Routes, Route } from "react-router";
import { MainLayout } from "./MainLayout.tsx";
import { useState, useRef } from "react";
import type { IApiImageData } from "../../backend/src/shared/ApiImageData.ts";
import { AllImages } from "./images/AllImages.tsx";
import { ValidRoutes } from "../../backend/src/shared/validRoutes.ts";
import { ImageSearchForm } from "./images/ImageSearchForm";
import { ProtectedRoute } from "./ProtectedRoute.tsx";

function App() {
    const [imageData, setImageData] = useState<IApiImageData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [searchString, setSearchString] = useState("");
    const [authToken, setAuthToken] = useState<string>("");

    const latestRequestNumber = useRef(0);

    function handleLoginSuccess(token: string) {
        setAuthToken(token);
        fetchImages(token);
    }

    function handleImageSearch() {
        fetchImages(authToken, searchString);
    }

    function fetchImages(token: string, search?: string) {
        const currentRequest = ++latestRequestNumber.current;

        setIsLoading(true);
        setHasError(false);

        let url = "/api/images";
        if (search && search.trim().length > 0) {
            const encoded = encodeURIComponent(search);
            url = `/api/images/search?name=${encoded}`;
        }

        fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                if (currentRequest !== latestRequestNumber.current) return;
                if (!response.ok) throw new Error("Network response was not ok");
                return response.json();
            })
            .then(data => {
                if (currentRequest !== latestRequestNumber.current) return;
                setImageData(data);
            })
            .catch(() => {
                if (currentRequest !== latestRequestNumber.current) return;
                setHasError(true);
            })
            .finally(() => {
                if (currentRequest !== latestRequestNumber.current) return;
                setIsLoading(false);
            });
    }

    return (
        <Routes>
            <Route path={ValidRoutes.HOME} element={<MainLayout />}>
                <Route
                    index
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <AllImages
                                images={imageData}
                                isLoading={isLoading}
                                hasError={hasError}
                                searchPanel={
                                    <ImageSearchForm
                                        searchString={searchString}
                                        onSearchStringChange={setSearchString}
                                        onSearchRequested={handleImageSearch}
                                    />
                                }
                            />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ValidRoutes.UPLOAD}
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <UploadPage authToken={authToken} onUploadSuccess={()=> fetchImages(authToken)}/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ValidRoutes.LOGIN}
                    element={
                        <LoginPage isRegistering={false} onLoginSuccess={handleLoginSuccess} />
                    }
                />
                <Route
                    path="/register"
                    element={
                        <LoginPage isRegistering={true} onLoginSuccess={handleLoginSuccess} />
                    }
                />
                <Route
                    path={ValidRoutes.IMAGE_DETAIL}
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <ImageDetails
                                images={imageData}
                                isLoading={isLoading}
                                hasError={hasError}
                                authToken={authToken}
                                setImageData={setImageData}
                            />
                        </ProtectedRoute>
                    }
                />
            </Route>
        </Routes>
    );
}

export default App;