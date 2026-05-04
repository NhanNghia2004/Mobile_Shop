import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes"; // Tự động nhận file index.tsx

function App() {
    return (
        <Router>
            <AppRoutes />
        </Router>
    );
}

export default App;