import { Route, Switch } from "wouter";
import { HomePage } from "./pages/home";
import { LoginPage } from "./pages/login";
import { ProtectedLayout } from "./lib/session";
import { MatchMakingPage } from "./pages/matchmaking";
import { AppLayout } from "./layout";
import { MatchMakingProvider } from "./features/matchmaking";

export default function App() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <ProtectedLayout>
        <MatchMakingProvider>
          <AppLayout>
            <Route path="/" component={HomePage} />
            <Route path="/matchmaking" component={MatchMakingPage} />
          </AppLayout>
        </MatchMakingProvider>
      </ProtectedLayout>
    </Switch>
  );
}
