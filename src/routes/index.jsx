import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Dashboard from "../pages/Dashboard";
import DarkStoreAdminRegistration from "../components/DarkstoreAdmin/DarkstoreAdminRegister";
import DarkStoreAdminLogin from "../components/DarkstoreAdmin/DarkstoreAdminLogin";


const router = createBrowserRouter([{
    path: "/",
    element: <App/>,
    children:[
        {
            path: "/",
            element: <Dashboard/>
        },
        {
            path: "/register",
            element: <DarkStoreAdminRegistration/>
        },
        {
            path: "/login",
            element: <DarkStoreAdminLogin/>
        }
    ]
}])

export default router;