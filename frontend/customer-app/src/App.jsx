import { AppLayout } from "./components";
import { MarketplaceProvider } from "./context/MarketplaceContext";

function App() {
    return (
        <MarketplaceProvider>
            <AppLayout />
        </MarketplaceProvider>
    );
}

export default App;