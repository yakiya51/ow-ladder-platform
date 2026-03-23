import { Route, Switch } from "wouter";
import { HomePage } from "./pages/home";
import { LoginPage } from "./pages/login";
import { AppLayout } from "./layout";
import { PlayPage } from "./pages/play";
import { ProtectedLayout } from "./lib/session";
import { MatchQueueProvider } from "./features/matchqueue-context";
import { WsProvider } from "./features/ws-context";

export default function App() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <ProtectedLayout>
        <WsProvider>
          <MatchQueueProvider>
            <AppLayout>
              <Route path="/" component={HomePage} />
              <Route path="/play" component={PlayPage} />
            </AppLayout>
          </MatchQueueProvider>
        </WsProvider>
      </ProtectedLayout>
    </Switch>
  );
}
