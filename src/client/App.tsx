import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { PortfolioPage } from './pages/PortfolioPage'
import { ServicesPage } from './pages/ServicesPage'
import { CalculatorPage } from './pages/CalculatorPage'
import { ReviewsPage } from './pages/ReviewsPage'
import { PromotionsPage } from './pages/PromotionsPage'
import { FaqPage } from './pages/FaqPage'
import { ContactPage } from './pages/ContactPage'
import { NotFoundPage } from './pages/NotFoundPage'

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminWorksPage } from './pages/admin/AdminWorksPage'
import { AdminServicesPage } from './pages/admin/AdminServicesPage'
import { AdminQueuePage } from './pages/admin/AdminQueuePage'
import { AdminAnnouncementsPage } from './pages/admin/AdminAnnouncementsPage'
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage'
import { AdminFaqsPage } from './pages/admin/AdminFaqsPage'
import { AdminPromotionsPage } from './pages/admin/AdminPromotionsPage'
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage'

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages with Common Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="portfolio/:id" element={<PortfolioPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="calculator" element={<CalculatorPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="contact" element={<ContactPage />} />
        {/* 404 Not Found Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Admin Login */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin Dashboard */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminWorksPage />} />
        <Route path="services" element={<AdminServicesPage />} />
        <Route path="queue" element={<AdminQueuePage />} />
        <Route path="announcements" element={<AdminAnnouncementsPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="faqs" element={<AdminFaqsPage />} />
        <Route path="promotions" element={<AdminPromotionsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
    </Routes>
  )
}
