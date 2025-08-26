import { Route, Switch, Router } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth";
import { WalletProvider } from "@/lib/wallet";

// Import all pages
import LoadingScreen from "@/pages/LoadingScreen";
import AuthSelection from "@/pages/AuthSelection";
import SignupMethod from "@/pages/SignupMethod";
import SignupEmail from "@/pages/SignupEmail";
import SignupApple from "@/pages/SignupApple";
import CaptchaVerification from "@/pages/CaptchaVerification";
import LoginMethod from "@/pages/LoginMethod";
import LoginEmail from "@/pages/LoginEmail";
import Home from "@/pages/Home";
import Wallet from "@/pages/Wallet";
import Deposit from "@/pages/Deposit";
import Withdraw from "@/pages/Withdraw";
import SecurityVerification from "@/pages/SecurityVerification";
import QRScan from "@/pages/QRScan";
import NFTPortfolio from "@/pages/NFTPortfolio";
import NFTDetail from "@/pages/NFTDetail";
import Settings from "@/pages/Settings";
import TradingInterface from "@/pages/TradingInterface";
import StoreLocator from "@/pages/StoreLocator";
import ProductCatalog from "@/pages/ProductCatalog";
import Analytics from "@/pages/Analytics";
import UserProfile from "@/pages/UserProfile";
import NotificationCenter from "@/pages/NotificationCenter";
import WalletLogin from "@/pages/WalletLogin";
import SendTokens from "@/pages/SendTokens";
import NotFoundPage from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WalletProvider>
          <div className="min-h-screen bg-dark-primary text-white">
            <Router>
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/auth-selection" component={AuthSelection} />
                <Route path="/signup" component={SignupMethod} />
                <Route path="/signup/email" component={SignupEmail} />
                <Route path="/signup/apple" component={SignupApple} />
                <Route path="/captcha" component={CaptchaVerification} />
                <Route path="/login" component={LoginMethod} />
                <Route path="/login/email" component={LoginEmail} />
                <Route path="/loading" component={LoadingScreen} />
                <Route path="/wallet" component={Wallet} />
                <Route path="/deposit" component={Deposit} />
                <Route path="/withdraw" component={Withdraw} />
                <Route path="/security" component={SecurityVerification} />
                <Route path="/qr-scan" component={QRScan} />
                <Route path="/nft-portfolio" component={NFTPortfolio} />
                <Route path="/nft/:id" component={NFTDetail} />
                <Route path="/settings" component={Settings} />
                <Route path="/trading" component={TradingInterface} />
                <Route path="/stores" component={StoreLocator} />
                <Route path="/catalog" component={ProductCatalog} />
                <Route path="/analytics" component={Analytics} />
                <Route path="/profile" component={UserProfile} />
                <Route path="/notifications" component={NotificationCenter} />
                <Route path="/wallet-login" component={WalletLogin} />
                <Route path="/send" component={SendTokens} />
                <Route component={NotFoundPage} />
              </Switch>
            </Router>
            <Toaster />
          </div>
        </WalletProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
