import "./App.css";

import { Outlet } from "react-router-dom";

import AlertBox from "./components/alertbox/AlertBox";
import Footer from "./components/footer/Footer";
import Header from "./components/header/Header";
import Progress from "./components/progress/Progress";
import { useUser } from "./hooks/user/useUser";
import { AlertProvider } from "./store/contexts/alert/AlertContext";
import { ConfirmationProvider } from "./store/contexts/confirmation/ConfirmationContext";
import { ProgressProvider } from "./store/contexts/progress/ProgressContext";
import { SasTokenProvider } from "./store/contexts/sastoken/SasTokenContext";
import { SearchProvider } from "./store/contexts/search/SearchContext";
import { UserProvider } from "./store/contexts/user/UserContext";

/**
 * The main application component.
 */
function App() {
  const { isLoading } = useUser();

  if (!isLoading) {
    return (
      <ConfirmationProvider>
        <AlertProvider>
          <UserProvider>
            <SearchProvider>
              <SasTokenProvider>
                <ProgressProvider>
                  <div id="modal" />
                  <div id="alert" />
                  <div id="progress" />
                  <AlertBox />
                  <Progress />
                  <div id="confirmation" />
                  <Header />
                  <main>
                    <Outlet />
                  </main>
                  <Footer />
                </ProgressProvider>
              </SasTokenProvider>
            </SearchProvider>
          </UserProvider>
        </AlertProvider>
      </ConfirmationProvider>
    );
  }
}

export default App;
