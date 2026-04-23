import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Award,
  Bell,
  Calendar,
  ChevronRight,
  Hexagon,
  Search,
} from 'lucide-react'

const typePhrases = [
  'Connect with Peers',
  'One Verified Platform',
  'Discover Opportunities',
]

const featureCards = [
  {
    title: 'Discover Events',
    description: 'Smart filters and real-time search to find exactly what interests you.',
    icon: Search,
  },
  {
    title: 'Easy Registration',
    description: 'One-tap registration and instant QR passes for seamless entry.',
    icon: Calendar,
  },
  {
    title: 'Smart Reminders',
    description: 'Never miss an event with personalized push and email notifications.',
    icon: Bell,
  },
  {
    title: 'Verified History',
    description: 'Track your participation and access all your event certificates in one place.',
    icon: Award,
  },
]

const stepCards = [
  {
    number: '1',
    title: 'Explore',
    description: 'Browse official campus events with live updates and smart filters.',
  },
  {
    number: '2',
    title: 'Register',
    description: 'Secure your spot instantly and receive your digital entry pass.',
  },
  {
    number: '3',
    title: 'Experience',
    description: 'Attend the event, get verified, and access your certificates.',
  },
]

const galleryColumns = [
  [
    'https://picsum.photos/300/360?seed=campus-1',
    'https://picsum.photos/300/400?seed=campus-2',
    'https://picsum.photos/300/340?seed=campus-3',
  ],
  [
    'https://picsum.photos/300/340?seed=campus-4',
    'https://picsum.photos/300/420?seed=campus-5',
    'https://picsum.photos/300/360?seed=campus-6',
  ],
  [
    'https://picsum.photos/300/360?seed=campus-7',
    'https://picsum.photos/300/390?seed=campus-8',
    'https://picsum.photos/300/340?seed=campus-9',
  ],
]

const fadeInProps = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: 'easeOut' },
}

export default function LandingPage() {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const currentPhrase = useMemo(() => typePhrases[phraseIndex], [phraseIndex])

  useEffect(() => {
    const typingSpeed = isDeleting ? 55 : 95
    const pauseDuration = 1300

    const timer = setTimeout(() => {
      if (!isDeleting && typedText === currentPhrase) {
        setTimeout(() => setIsDeleting(true), pauseDuration)
        return
      }

      if (isDeleting && typedText === '') {
        setIsDeleting(false)
        setPhraseIndex((prev) => (prev + 1) % typePhrases.length)
        return
      }

      const nextLength = isDeleting ? typedText.length - 1 : typedText.length + 1
      setTypedText(currentPhrase.slice(0, nextLength))
    }, typingSpeed)

    return () => clearTimeout(timer)
  }, [currentPhrase, isDeleting, typedText])

  return (
    <div className="bg-white text-slate-900">
      <style>{`
        @keyframes moveUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes blinkCursor {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="relative">
                <Hexagon className="w-8 h-8 text-[#2563EB]" strokeWidth={2.2} />
                <span className="absolute inset-0 flex items-center justify-center text-[#2563EB] text-sm font-extrabold">
                  C
                </span>
              </div>
              <span className="text-xl font-bold text-[#0F172A]">CampusConnect</span>
            </Link>

            <nav className="hidden md:flex items-center gap-9 text-sm font-medium text-slate-700">
              <a href="#features" className="hover:text-[#4F46E5]">Features</a>
              <a href="#students" className="hover:text-[#4F46E5]">Students</a>
              <a href="#organizers" className="hover:text-[#4F46E5]">Organizers</a>
              <a href="#how-it-works" className="hover:text-[#4F46E5]">How it Works</a>
            </nav>

            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold text-slate-800 hover:text-[#4F46E5]">
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#4F46E5] to-[#4338CA] shadow-sm hover:opacity-95"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <motion.section {...fadeInProps} className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-[#0F172A] leading-tight">
              All Campus
              <br />
              Events.
            </h1>
            <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#4338CA] to-[#3B82F6] min-h-[7.5rem]">
              {typedText}
              <span className="inline-block ml-1 text-[#4F46E5]" style={{ animation: 'blinkCursor 1s step-end infinite' }}>|</span>
            </h2>
            <p className="mt-5 text-lg text-slate-600 max-w-xl">
              The all-in-one platform for campus events, workshops, and networking.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#4F46E5] text-white font-semibold hover:bg-[#4338CA]"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((seed) => (
                    <img
                      key={seed}
                      src={`https://picsum.photos/40/40?seed=avatar-${seed}`}
                      alt="Student avatar"
                      className="w-9 h-9 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-500">Joined by 500+ students</span>
              </div>
            </div>
          </div>

          <div className="bg-[#EDE9FE] rounded-3xl p-6 h-[640px] overflow-hidden">
            <div className="grid grid-cols-3 gap-4 h-full">
              {galleryColumns.map((column, columnIndex) => (
                <div key={`col-${columnIndex}`} className="overflow-hidden rounded-2xl">
                  <div
                    className="flex flex-col gap-4"
                    style={{
                      animation: `moveUp ${20 + columnIndex * 4}s linear infinite`,
                    }}
                  >
                    {[...column, ...column].map((image, idx) => (
                      <img
                        key={`${image}-${idx}`}
                        src={image}
                        alt="Campus event"
                        className="w-full h-auto rounded-2xl object-cover"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section id="features" {...fadeInProps} className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-4xl font-extrabold text-[#0F172A]">One Platform, Endless Possibilities</h3>
            <p className="mt-4 text-lg text-slate-600">
              Everything you need to navigate campus life, all in one verified place.
            </p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {featureCards.map(({ title, description, icon: Icon }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#4F46E5]" />
                </div>
                <h4 className="mt-5 text-xl font-bold text-[#0F172A]">{title}</h4>
                <p className="mt-3 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section id="students" {...fadeInProps} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-bold tracking-widest text-[#4F46E5]">FOR STUDENTS</p>
            <h3 className="mt-3 text-5xl font-extrabold text-[#0F172A] leading-tight">Enhance your campus experience</h3>
            <p className="mt-5 text-lg text-slate-600">
              Stay updated with everything happening on campus. From technical hackathons to cultural fests, Campus Connect is your key to an active student life.
            </p>

            <ul className="mt-7 space-y-4">
              {[
                'Verified events from official clubs',
                'Instant event certificates',
                'Networking with like-minded peers',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-700">
                  <span className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-emerald-500" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <img
              src="https://picsum.photos/600/400?random=10"
              alt="Students collaborating"
              className="w-full rounded-3xl shadow-xl object-cover"
            />
          </div>
        </div>
      </motion.section>

      <motion.section id="organizers" {...fadeInProps} className="py-20 bg-[#1E1B4B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div className="grid gap-5">
            <img
              src="https://picsum.photos/560/260?seed=organizer-1"
              alt="Organizers planning event"
              className="w-full rounded-2xl object-cover"
            />
            <img
              src="https://picsum.photos/560/260?seed=organizer-2"
              alt="Event dashboard analytics"
              className="w-full rounded-2xl object-cover"
            />
          </div>

          <div>
            <p className="text-sm font-bold tracking-widest text-indigo-300">FOR ORGANIZERS</p>
            <h3 className="mt-3 text-5xl font-extrabold text-white leading-tight">Manage events with precision</h3>
            <p className="mt-5 text-indigo-100 text-lg">
              Empower your club or organization with a professional management dashboard. Track registrations, verify attendance, and issue certificates automatically.
            </p>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {[
                ['Analytics', 'Real-time data'],
                ['Security', 'Verified entry'],
                ['Scaling', '5000+ capacity'],
                ['Automation', 'Auto-certs'],
              ].map(([title, subtitle]) => (
                <div key={title} className="bg-indigo-950/50 border border-indigo-800 rounded-xl p-5">
                  <p className="text-xl font-bold text-white">{title}</p>
                  <p className="text-indigo-200 mt-1">{subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section id="how-it-works" {...fadeInProps} className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-extrabold text-[#0F172A]">How it works</h3>
          <p className="mt-3 text-lg text-slate-600">Get started in three simple steps</p>

          <div className="relative mt-14 grid md:grid-cols-3 gap-10">
            <div className="hidden md:block absolute top-10 left-[16.5%] right-[16.5%] h-px bg-slate-200" />
            {stepCards.map((step) => (
              <div key={step.number} className="relative">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#4F46E5] shadow-lg flex items-center justify-center text-white text-3xl font-extrabold">
                  {step.number}
                </div>
                <h4 className="mt-7 text-3xl font-bold text-[#0F172A]">{step.title}</h4>
                <p className="mt-3 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section {...fadeInProps} className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2.3rem] bg-[#4F46E5] py-16 px-8 text-center">
            <h3 className="text-white text-4xl sm:text-5xl font-extrabold">Ready to dive in?</h3>
            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-white text-white font-semibold hover:bg-white hover:text-[#4F46E5] transition-colors"
            >
              Get Started Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.section>

      <footer className="bg-slate-100 py-14">
        <div className="max-w-4xl mx-auto text-center px-4">
          <p className="text-3xl font-bold text-[#4F46E5]">Campus Connect</p>
          <p className="mt-3 text-slate-600">
            Your one-stop platform for discovering and managing all campus events.
          </p>
          <p className="mt-4 text-sm text-slate-500">© 2026 Campus Connect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
