import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { Routes, Route } from "react-router";
import { MainLayout } from "./MainLayout.tsx";
import { useState, useEffect } from "react";
import type { IApiImageData } from "../../backend/src/shared/ApiImageData.ts";
import { AllImages } from "./images/AllImages.tsx";
import { ValidRoutes } from "../../backend/src/shared/validRoutes.ts";

function App() {
    const[imageData, setImageData] = useState<IApiImageData[]>([]);
    const[isLoading, setIsLoading] = useState(true);
    const[hasError, setHasError] = useState(false); 

    useEffect(() => {
        fetch("/api/images")
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(data => {
            setImageData(data);
        })
        .catch(() => {
            setHasError(true);
        })
        .finally(() => {
            setIsLoading(false);
        });
    }, []);

    return(
        <Routes>
            <Route path={ValidRoutes.HOME} element={<MainLayout />}>
                <Route index element={<AllImages images={imageData} isLoading={isLoading} hasError={hasError}/>} />
                <Route path={ValidRoutes.UPLOAD} element={<UploadPage />} />
                <Route path={ValidRoutes.LOGIN} element={<LoginPage />} />
                <Route path={ValidRoutes.IMAGE_DETAIL} element={<ImageDetails images={imageData} isLoading={isLoading} hasError={hasError} setImageData={setImageData}/>} />
            </Route>
        </Routes>
    )
}

export default App;
