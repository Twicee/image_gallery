import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { Routes, Route } from "react-router";
import { MainLayout } from "./MainLayout.tsx";
import { useState } from "react";
import { fetchDataFromServer } from "./MockAppData.ts";
import type { IImageData } from "./MockAppData.ts";
import { AllImages } from "./images/AllImages.tsx";
import { ValidRoutes } from "../../backend/src/shared/validRoutes.ts";

function App() {
    const[imageData] = useState<IImageData[]>(fetchDataFromServer);

    return(
        <Routes>
            <Route path={ValidRoutes.HOME} element={<MainLayout />}>
                <Route index element={<AllImages images={imageData} />} />
                <Route path={ValidRoutes.UPLOAD} element={<UploadPage />} />
                <Route path={ValidRoutes.LOGIN} element={<LoginPage />} />
                <Route path={ValidRoutes.IMAGE_DETAIL} element={<ImageDetails images={imageData} />} />
            </Route>
        </Routes>
    )
}

export default App;
