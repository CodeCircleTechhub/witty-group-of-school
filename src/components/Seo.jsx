import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const base = 'Witty Group of Schools'
const site = 'https://wittyacademy.com'
const logo = `${site}/logo.jpeg`
const socialImage = `${site}/og-image.jpg`
const socialImageAlt = 'Witty Group of Schools logo with students in school uniform'

const homeKeywords = 'Witty Group of Schools, Witty Academy Ilorin, Islamic and Western school Ilorin, primary school Ilorin, secondary school Ilorin, Kwara State school, Basin Road school, NHIS Ilorin school, Quranic and Western education, WAEC NECO Ilorin, school portal Ilorin, admission Ilorin'

const homeDescription =
  'Islamic & Western academy in Ilorin, Kwara State. Success in Both Worlds — primary & secondary learning, WAEC/NECO prep, and a connected school portal.'

const metas = {
  '/': { title: `${base} | Islamic & Western Academy, Ilorin`, description: homeDescription, keywords: homeKeywords },
  '/about': { title: `About Us | ${base}, Ilorin`, description: 'Established 2023, Witty Group of Schools unites Qur\'anic excellence with the Nigerian curriculum for primary and secondary learners in Ilorin, Kwara State.', keywords: `about ${base}, Islamic school Ilorin, school history Ilorin, mission and vision` },
  '/register': { title: `Admission Registration | ${base}`, description: 'Admissions are open for the 2025/2026 session. Register your child for primary or secondary education at Witty Group of Schools, Ilorin.', keywords: `admission Ilorin, school registration Ilorin, ${base} admission` },
  '/login': { title: `Portal Login | ${base}`, description: 'Admins, teachers, students and parents sign in to the Witty Group of Schools portal for results, attendance, fees and reports.', keywords: `school portal Ilorin, ${base} login, WGS portal` },
  '/forgot-password': { title: `Reset Password | ${base}`, description: 'Reset your Witty Group of Schools portal password using a 6-digit email verification code.', keywords: `reset ${base} portal password` },
  '/admin': { title: `Admin Portal | ${base}`, description: 'Welcome to the Witty Group of Schools administration dashboard.', keywords: `admin portal ${base}` },
  '/teacher': { title: `Teacher Portal | ${base}`, description: 'Welcome to the Witty Group of Schools teacher portal.', keywords: `teacher portal ${base}` },
  '/student': { title: `Student Portal | ${base}`, description: 'Welcome to the Witty Group of Schools student portal.', keywords: `student portal ${base}` },
  '/parent': { title: `Parent Portal | ${base}`, description: 'Welcome to the Witty Group of Schools parent portal.', keywords: `parent portal ${base}` },
}

const fallback = {
  title: `${base} | Islamic & Western Academy, Ilorin`,
  description: homeDescription,
  keywords: homeKeywords,
}

function metaFor(pathname) {
  const exact = metas[pathname]
  if (exact) return exact
  const role = pathname.startsWith('/admin')
    ? '/admin'
    : pathname.startsWith('/teacher')
      ? '/teacher'
      : pathname.startsWith('/student')
        ? '/student'
        : pathname.startsWith('/parent')
          ? '/parent'
          : null
  return role ? metas[role] : fallback
}

function upsertMeta(selector, attribute, key, value) {
  let el = document.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attribute, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

export default function Seo() {
  const { pathname } = useLocation()

  useEffect(() => {
    const { title, description, keywords } = metaFor(pathname)
    const url = `${site}${pathname === '/' ? '/' : pathname.replace(/\/+$/, '')}`

    document.title = title
    upsertMeta('meta[name="description"]', 'name', 'description', description)
    upsertMeta('meta[name="keywords"]', 'name', 'keywords', keywords)

    const canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) canonical.setAttribute('href', url)

    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title)
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description)
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', url)
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', socialImage)
    upsertMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt', socialImageAlt)
    upsertMeta('meta[property="og:logo"]', 'property', 'og:logo', logo)

    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', socialImage)
    upsertMeta('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', socialImageAlt)
  }, [pathname])

  return null
}
