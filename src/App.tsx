import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppLayout from "./layout/AppLayout";
import AuthLayout from "./layout/AuthLayout";
import SignIn from "./pages/AuthPages/SignIn";
import Ecommerce from "./pages/Dashboard/ECommerce";
import AdminProtect from "./components/AdminProtect";
import AutoNotification from "./pages/More/autonotification";
import PushNotification from "./pages/More/pushnotification";
import Monitoring from "./pages/Monitoring";
import DeepLinkAnalytics from "./pages/VideoCollab/deeplinkanalytic";
import PremiumPlan from "./pages/More/premiumplan";
import CardBg from "./pages/More/cardBg";
import EmotionCardBg from "./pages/More/emotionCardBg";
import EmotionEmoji from "./pages/More/emotionEmoji";
import EmotionContent from "./pages/More/emotionContent";
import Device from "./pages/More/device";
import HintContent from "./pages/Hint/content";
import Category from "./pages/Hotness/category";
import HotnessCardBg from "./pages/Hotness/cardbg";
import WebAnalytics from "./pages/StoryCollab/Webanalytics";
import Temp from "./pages/More/temp";
import FriendCardBg from "./pages/Friends/cardbg";
import Collab from "./pages/collab/Collab";
import UnreadNotification from "./pages/collab/UnreadNotification";
import ChallengeContent from "./pages/Challenge/challengeContent";
import BluffCardBg from "./pages/Bluff/cardbg";
import TestingUrls from "./pages/Monitoring/testingurls";
import Message from "./pages/Message/message";
import HeavenHellCardBg from "./pages/HeavenHell/heavenHellCardbg";
import HeavenHellContent from "./pages/HeavenHell/heavenHellContent";
import ComingSoon from "./pages/comingSoon/comingSoon";

export default function App() {
  return (
    <BrowserRouter basename="/">
      <UnreadNotification />
      <Routes>
        {/* Dashboard Layout */}
        <Route element={<AppLayout />}>
          <Route index element={<AdminProtect><Ecommerce /></AdminProtect>} />
          
          <Route path="monitoring" element={<AdminProtect><Monitoring /></AdminProtect>} />
          <Route path="testing-urls" element={<AdminProtect><TestingUrls /></AdminProtect>} />

          {/* All Page */}
          <Route path="hint/content" element={<AdminProtect><HintContent /></AdminProtect>} />
          <Route path="premium" element={<AdminProtect><PremiumPlan /></AdminProtect>} />
          <Route path="cardBg" element={<AdminProtect><CardBg /></AdminProtect>} />
          <Route path="emotion/cardBg" element={<AdminProtect><EmotionCardBg /></AdminProtect>} />
          <Route path="emotion/emoji" element={<AdminProtect><EmotionEmoji /></AdminProtect>} />
          <Route path="emotion/content" element={<AdminProtect><EmotionContent /></AdminProtect>} />
          <Route path="hotness/category" element={<AdminProtect><Category /></AdminProtect>} />
          <Route path="hotness/cardBg" element={<AdminProtect><HotnessCardBg /></AdminProtect>} />
          <Route path="friend/cardBg" element={<AdminProtect><FriendCardBg /></AdminProtect>} />
          <Route path="bluff/cardBg" element={<AdminProtect><BluffCardBg /></AdminProtect>} />
          <Route path="heaven-hell/cardBg" element={<AdminProtect><HeavenHellCardBg /></AdminProtect>} />
          <Route path="heaven-hell/content" element={<AdminProtect><HeavenHellContent /></AdminProtect>} />
          <Route path="challenge/content" element={<AdminProtect><ChallengeContent /></AdminProtect>} />
          <Route path="auto-notification" element={<AdminProtect><AutoNotification /></AdminProtect>} />
          <Route path="push-notification" element={<AdminProtect><PushNotification /></AdminProtect>} />
          <Route path="coming-soon" element={<AdminProtect><ComingSoon /></AdminProtect>} />
          <Route path="collab" element={<AdminProtect><Collab /></AdminProtect>} />
          <Route path="temp" element={<AdminProtect><Temp /></AdminProtect>} />
          <Route path="message" element={<AdminProtect><Message /></AdminProtect>} />

          {/* Analytics Page */}
          <Route path="device" element={<AdminProtect><Device /></AdminProtect>} />
          <Route path="story-collaboration" element={<AdminProtect><WebAnalytics /></AdminProtect>} />
          <Route path="video-collaboration" element={<AdminProtect><DeepLinkAnalytics /></AdminProtect>} />

          {/* Fallback Route */}
          <Route path="*" element={<AdminProtect><Ecommerce /></AdminProtect>} />
        </Route>

        {/* Auth Layout */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<SignIn />} />
        </Route>
      </Routes>
      <ToastContainer position="top-right" className="!z-[99999]" />
    </BrowserRouter>
  );
}