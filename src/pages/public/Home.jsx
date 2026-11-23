import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowRight, GraduationCap, School as SchoolIcon, BookOpen, HeartHandshake, Shield,
  Star, Megaphone, CalendarDays, MapPin, Phone, Mail, Users, Sparkles, Award, Target, Moon, Newspaper,
} from 'lucide-react'
import SiteNav from '../../components/layout/SiteNav'
import SiteFooter from '../../components/layout/SiteFooter'
import { school } from '../../data/mock'
import { site } from '../../services/api'
import heroImg from '../../assets/witty.jpeg'

const blaze = (i = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, delay: i * 0.08 },
})

const whyChoose = [
  { icon: Moon, title: 'Islamic & Western Education', desc: 'Qur\'anic excellence and modern curriculum united under one roof.' },
  { icon: BookOpen, title: 'Tailored Guidance', desc: 'Every child supported according to their unique academic and moral background.' },
  { icon: Users, title: 'Caring, Qualified Staff', desc: 'A dedicated team of experienced and compassionate educators.' },
  { icon: Shield, title: 'Safe & Disciplined', desc: 'A secure, orderly and moral learning environment parents can trust.' },
  { icon: Target, title: 'Strong Results', desc: 'Consistent academic performance with structured CA, exams and reports.' },
  { icon: HeartHandshake, title: 'Parent Partnership', desc: 'Transparent portal access to results, fees, attendance and more.' },
]

const eventTone = {
  exam: 'bg-navy-600',
  meeting: 'bg-gold-500',
  sports: 'bg-emerald-600',
  islamic: 'bg-teal-700',
  resumption: 'bg-sky-600',
}

export default function Home() {
  const [announcements, setAnnouncements] = useState([])
  const [events, setEvents] = useState([])
  const [newsLoading, setNewsLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.allSettled([site.announcements({ limit: 4 }), site.events({ limit: 5 })])
      .then(([announcementResult, eventResult]) => {
        if (!active) return
        if (announcementResult.status === 'fulfilled') setAnnouncements(announcementResult.value.data || [])
        if (eventResult.status === 'fulfilled') setEvents(eventResult.value.data || [])
      })
      .finally(() => {
        if (active) setNewsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      <section className="relative flex min-h-[82vh] flex-col justify-center overflow-hidden bg-navy-950 text-white lg:min-h-[680px]">
        <div className="absolute inset-0 bg-cover bg-center lg:bg-[position:50%_40%]" style={{ backgroundImage: `url(${heroImg})` }} />
        <div className="absolute inset-0 lg:hidden"
          style={{ background: 'radial-gradient(circle at 50% 45%, rgba(5,14,38,0.42) 0%, rgba(5,14,38,0.9) 80%)' }}
        />
        <div className="absolute inset-0 hidden lg:block"
          style={{ background: 'linear-gradient(100deg, rgba(5,14,38,0.95) 0%, rgba(5,14,38,0.82) 45%, rgba(5,14,38,0.5) 72%, rgba(5,14,38,0.3) 100%)' }}
        />
        {/* Gold decorative circle: reduced size, repositioned to avoid overflow */}
        <div className="pointer-events-none absolute top-4 right-4 rounded-full bg-gold-500/5 blur-lg w-16 h-16" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-24">
          <div>
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-gold-400 backdrop-blur sm:px-4 sm:text-sm">
              <Sparkles size={14} /> Since {school.established} • Basin Road, Ilorin
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mt-5 text-[2rem] font-extrabold leading-[1.15] tracking-tight sm:mt-6 sm:text-6xl">
              Where Faith Meets<br className="hidden sm:block" />{" "}the <span className="text-gold-400">Future</span> of Learning
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-4 max-w-xl text-base leading-relaxed text-cream-100/80 sm:mt-5 sm:text-lg">
              {school.tagline}. An Islamic and Western academy empowering every child with academic brilliance, moral integrity, and proud character.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link to="/register" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 px-6 py-3 font-bold text-navy-950 shadow-lg shadow-gold-500/30 transition hover:bg-gold-400 active:scale-95 sm:w-auto">
                Enrol Your Ward <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3 font-bold text-white backdrop-blur transition hover:bg-white/20 active:scale-95 sm:w-auto">
                Enter Student Portal
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-cream-100/70 sm:mt-10 sm:gap-x-8 sm:text-sm">
              <span className="inline-flex items-center gap-2"><Award size={16} className="text-gold-400" /> 1,250+ Students</span>
              <span className="inline-flex items-center gap-2"><GraduationCap size={16} className="text-gold-400" /> 85+ Teachers</span>
              <span className="inline-flex items-center gap-2"><Star size={16} className="text-gold-400" /> 98% Pass Rate</span>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:rounded-3xl sm:p-6">
              <p className="font-arabic text-xl text-gold-400 sm:text-2xl">{school.mottoArabic}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-cream-100/70 sm:text-sm">Our Motto</p>
              <h3 className="mt-2 text-lg font-extrabold sm:text-xl">{school.motto}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream-100/75 sm:mt-3">{school.mission}</p>
              <div className="mt-5 hidden grid-cols-2 gap-3 sm:grid">
                <div className="rounded-xl bg-white/5 p-3 text-xs">
                  <p className="text-cream-100/60">Uniform Colour</p>
                  <p className="mt-1 flex items-center gap-2 font-bold">
                    <span className="h-3 w-3 rounded-full bg-cream-100" /> Shirt: {school.uniform.shirt}
                  </p>
                  <p className="mt-1 flex items-center gap-2 font-bold">
                    <span className="h-3 w-3 rounded-full bg-navy-400" /> Trouser: {school.uniform.trouser}
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 p-3 text-xs">
                  <p className="text-cream-100/60">Session</p>
                  <p className="mt-1 font-bold">{school.session} • {school.term}</p>
                  <p className="mt-2 text-cream-100/60">Portal Access</p>
                  <p className="mt-1 font-bold">Students • Parents • Staff</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl bg-gold-500 px-5 py-3 text-navy-950 shadow-lift sm:block">
              <p className="text-xs font-semibold uppercase tracking-wide">Fully Transitioning</p>
              <p className="text-sm font-extrabold">Analog → Digital Portal</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
        <motion.div {...blaze()} className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-gold-600">Welcome to Witty</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">A Heartfelt Welcome Message</h2>
          <p className="mx-auto mt-4 max-w-3xl text-left leading-relaxed text-slate-600 text-pretty sm:text-center">
            Dear Parents, Guardians, and our dear Learners,
          </p>
          <p className="mx-auto mt-3 max-w-3xl text-left leading-relaxed text-slate-600 text-pretty sm:text-center">
            It is with immense joy that we welcome you to Witty Group of Schools — a place where every child
            is seen, every voice is heard, and every potential is nurtured. Here, your child will grow in
            knowledge, deepen in faith, and blossom in character. As the Prophet Muhammad (peace be upon him)
            taught, <em className="font-semibold text-navy-800">"Seeking knowledge is an obligation upon every Muslim."</em>{' '}
            We take that sacred duty seriously, blending it beautifully with modern academic rigour.
            Together, let us raise children who succeed in this world and the Hereafter.
          </p>
          <p className="mt-4 font-semibold text-navy-800 sm:mt-3">— Management, Witty Group of Schools</p>
        </motion.div>
      </section>

      <section className="bg-cream-100/60 py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div {...blaze()} className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-gold-600">Why Choose Us</p>
            <h2 className="mt-2 text-2xl font-extrabold text-navy-900 sm:text-3xl">The Witty Advantage</h2>
          </motion.div>
          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {whyChoose.map((c, i) => (
              <motion.div key={c.title} {...blaze(i)} className="group rounded-2xl border border-navy-100 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-400/40 hover:shadow-lift sm:p-6">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy-800 text-gold-400 transition group-hover:bg-gold-500 group-hover:text-navy-950">
                  <c.icon size={22} />
                </span>
                <h3 className="mt-4 text-lg font-bold text-navy-900">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
        <motion.div {...blaze()} className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-gold-600">Our Sections</p>
          <h2 className="mt-2 text-2xl font-extrabold text-navy-900 sm:text-3xl">One Family, Two Schools</h2>
        </motion.div>
        <div className="mt-8 grid gap-6 sm:mt-10 md:grid-cols-2 md:gap-8">
          {[
            { icon: SchoolIcon, name: 'Witty Primary School', desc: 'A strong foundation in literacy, numeracy, Islamic values and character from Early Years to Grade 6.', color: 'from-emerald-600 to-teal-700', fill: 'bg-teal-700' },
            { icon: GraduationCap, name: 'Witty Secondary School', desc: 'JSS to SS — WAEC & NECO-ready learners, trained in sciences, humanities, commerce, Islamic and Arabic studies.', color: 'from-navy-600 to-navy-900', fill: 'bg-navy-700' },
          ].map((s, i) => (
            <motion.div key={s.name} {...blaze(i)} className="group overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-card transition-all duration-300 hover:shadow-lift">
              <div className={`bg-gradient-to-br ${s.color} p-6 text-white sm:p-8`}>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur sm:h-14 sm:w-14">
                  <s.icon size={26} className="text-gold-400 sm:h-7 sm:w-7" />
                </span>
                <h3 className="mt-4 text-xl font-extrabold sm:mt-5 sm:text-2xl">{s.name}</h3>
                <p className="mt-2 max-w-md text-sm text-white/80">{s.desc}</p>
              </div>
              <div className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-navy-700">
                  <GraduationCap size={16} className="text-gold-500" /> Fully integrated on the same portal
                </div>
                <span className="rounded-full bg-cream-100 px-3 py-1 text-xs font-bold text-navy-700">
                  {i === 0 ? 'Foundation' : 'WAEC • NECO'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-navy-950 py-12 text-white sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:gap-10 sm:px-6 lg:grid-cols-2">
          <motion.div {...blaze()}>
            <div className="flex items-center gap-2 text-gold-400">
              <Newspaper size={20} /><h3 className="text-xl font-extrabold">News & Announcements</h3>
            </div>
            <div className="mt-6 space-y-4">
              {newsLoading && (
                <p className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-cream-100/60">Loading latest updates…</p>
              )}
              {!newsLoading && !announcements.length && (
                <p className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-cream-100/60">No announcements yet. Check back soon.</p>
              )}
              {announcements.map((a) => (
                <div key={a.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
                  <div className="flex items-center gap-2 text-xs text-gold-400">
                    <Megaphone size={14} /> {a.tag} • {(a.date || '').split(',')[0]}
                  </div>
                  <h4 className="mt-2 font-bold">{a.title}</h4>
                  <p className="mt-1 line-clamp-2 text-sm text-cream-100/60">{a.message}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div {...blaze(1)}>
            <div className="flex items-center gap-2 text-gold-400">
              <CalendarDays size={20} /><h3 className="text-xl font-extrabold">Upcoming Events</h3>
            </div>
            <div className="mt-6 space-y-4">
              {newsLoading && (
                <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-cream-100/60">Loading upcoming events…</p>
              )}
              {!newsLoading && !events.length && (
                <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-cream-100/60">No upcoming events scheduled.</p>
              )}
              {events.map((e) => (
                <div key={e.id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 sm:gap-4">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${eventTone[e.type] || 'bg-navy-600'} text-sm font-bold sm:h-12 sm:w-12 sm:text-base`}>
                    {(e.date || '').split(' ')[0] || '—'}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-bold">{e.title}</h4>
                    <p className="line-clamp-2 text-sm text-cream-100/60">
                      {[e.description, e.location].filter(Boolean).join(' • ') || 'School event'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
        <motion.div {...blaze()} className="rounded-3xl border border-navy-100 bg-gradient-to-br from-cream-50 to-cream-100 p-6 text-center shadow-card sm:p-10">
          <h2 className="text-xl font-extrabold text-navy-900 sm:text-3xl">Ready to Give Your Child the Witty Advantage?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            Join a school where faith and scholarship flourish together. Admissions are open for the {school.session} session.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
            <Link to="/register" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy-800 px-7 py-3 font-bold text-white shadow-lg shadow-navy-800/25 transition hover:bg-navy-900 active:scale-95 sm:w-auto">
              Register Now <ArrowRight size={18} />
            </Link>
            <div className="flex w-full flex-col items-start gap-2 rounded-xl border border-navy-100 bg-white px-4 py-3 text-sm text-navy-800 sm:w-auto sm:flex-row sm:items-center sm:gap-6 sm:px-6">
              <span className="flex items-center gap-2"><Phone size={15} className="shrink-0 text-gold-600" /> {school.phones.join(' • ')}</span>
              <span className="flex items-center gap-2"><Mail size={15} className="shrink-0 text-gold-600" /> {school.email}</span>
              <span className="hidden items-center gap-2 md:flex"><MapPin size={15} className="shrink-0 text-gold-600" /> {school.location}</span>
            </div>
          </div>
        </motion.div>
      </section>

      <SiteFooter />
    </div>
  )
}