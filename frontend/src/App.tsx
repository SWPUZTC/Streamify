import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import { Result } from 'antd';
import Loader from './components/Loader';
import useAuthUser from './hooks/useAuthUser';
import { useThemeStore } from './store/ThemeStore';

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Home = lazy(() => import("./pages/Home"));
const Notification = lazy(() => import("./pages/Notification"));
const Call = lazy(() => import("./pages/Call"));
const Chat = lazy(() => import("./pages/Chat"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Layout = lazy(() => import("./components/Layout"));


function App() {
  const { isLoading, authUser } = useAuthUser();
  const isAuthenticated = Boolean(authUser);
  const isOnboarding = authUser?.isOnboarded;
  const { theme } = useThemeStore();

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <Loader/>
    );
  }

  return (
    <>
      <div className='min-h-screen' data-theme={theme}>
        <Suspense fallback={<Loader/>}>
        <Routes>
          <Route
            path="/"
            element={isAuthenticated && isOnboarding ? (
            <Layout showSidebar={true}>
              <Home />
            </Layout>) : 
            (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
          />

          <Route
            path="/register"
            element={!isAuthenticated ? <Register /> : <Navigate to={isOnboarding ? "/" : "/onboarding"} replace />}
          />

          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to={isOnboarding ? "/" : "/onboarding"} replace />}
          />

          <Route
            path="/notifications"
            element={isAuthenticated && isOnboarding ? (<Layout showSidebar={true}><Notification/></Layout>) : <Navigate to={isAuthenticated ? "/onboarding" : "/login"} replace/>}
          />

          <Route
            path="/call/:id"
            element={isAuthenticated && isOnboarding ? <Call/> : <Navigate to={isAuthenticated ? "/onboarding" : "/login"} replace/>}
          />

          <Route
            path="/chat/:id"
            element={isAuthenticated && isOnboarding ? (
            <Layout showSidebar={false}>
              <Chat/>
            </Layout>
          ) 
            : <Navigate to={isAuthenticated ? "/onboarding" : "/login"} replace/>}
          />

          <Route
            path="/onboarding"
            element={isAuthenticated ? (
              !isOnboarding ? (
                <Onboarding/>
              ) : (
                <Navigate to="/" replace/>
              )
            ) : <Navigate to="/login" replace/>}
          />

          <Route path="*" element={<Result status="404" title="404" subTitle="Sorry, the page you visited does not exist." />} />
        </Routes>
        </Suspense>
        <Toaster />
      </div>
    </>
  )
}

export default App
