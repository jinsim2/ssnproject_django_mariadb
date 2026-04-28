import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import './index.css'
import { App, RegisterMain, RegisterStep1, RegisterStep2, RegisterStep3, RegisterStep4, Login, FindIdPw, Cart, Checkout, MyClassroom, CoursePlayer } from './pages'
import { MainLayout, BlankLayout, AdminLayout } from './layouts'
import { Toaster } from "./components/ui";

import { AdminLogin, Dashboard, InstitutionList, InstructorList, CourseList, EnrollmentList } from './pages/admin';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<App />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/findIdPw" element={<FindIdPw />} />
          <Route path="/register" element={<RegisterMain />} />
          <Route path="/register/step1" element={<RegisterStep1 />} />
          <Route path="/register/step2" element={<RegisterStep2 />} />
          <Route path="/register/step3" element={<RegisterStep3 />} />
          <Route path="/register/step4" element={<RegisterStep4 />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-classroom" element={<MyClassroom />} />
        </Route>
        <Route element={<BlankLayout />}>
          {/* 헤더/푸터 없는 페이지 등록 */}
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/my-classroom/player/:id" element={<CoursePlayer />} />
        </Route>
        <Route element={<AdminLayout />}>
          {/* 관리자 페이지들을 등록 */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/institution/index" element={<InstitutionList />} />
          <Route path="/member/instructors" element={<InstructorList />} />
          <Route path="/lecture/list" element={<CourseList />} />
          <Route path="/enrollment/list" element={<EnrollmentList />} />
        </Route>
      </Routes>
    </BrowserRouter>
    <Toaster richColors position="top-center" duration={2000} />
  </StrictMode>,
);
