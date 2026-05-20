'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  Apple,
  BadgeCheck,
  Barcode,
  Camera,
  Carrot,
  ChefHat,
  Cherry,
  Droplets,
  Leaf,
  Loader2,
  Milk,
  Search,
  ShieldAlert,
  Soup,
  Sparkles,
  Wheat,
  X,
  Volume2,
  VolumeX,
  Swords,
  Crown,
  History,
  RotateCcw,
  Trophy,
  HelpCircle,
  Sparkle
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type Product = {
  barcode: string
  name: string
  brand: string
  imageUrl?: string
  ingredientsText?: string
  ingredients: string[]
  allergens: string[]
  nutrition: Record<string, number | undefined>
}

type Analysis = {
  health_score: number
  risk_level: string
  risky_ingredients: { ingredient: string; risk_level: string; reason: string }[]
  warnings: string[]
  positives: string[]
  recommendation: string
}

type ScanResult = {
  product: Product
  analysis: Analysis
}

type Profile = {
  goal: string
  allergies: string[]
  diet: string
  condition: string
}

declare global {
  interface Window {
    BarcodeDetector?: any
  }
}

const sampleBarcodes = ['3017620422003', '737628064502', '8901764012906']
const allergyOptions = [
  { value: 'milk', icon: Milk },
  { value: 'peanuts', icon: Soup },
  { value: 'gluten', icon: Wheat },
  { value: 'soy', icon: Leaf },
  { value: 'egg', icon: ChefHat },
]

const mascotFacts = [
  "Cacao beans (used for chocolate) were once used as currency by the Aztecs!",
  "Carrots were originally purple or yellow, not orange!",
  "Apples float in water because 25% of their volume is actually air!",
  "The world's most expensive snack is a Gold-leaf covered donut costed $100!",
  "Did you know honey never spoils? You could theoretically eat 3,000-year-old honey!",
  "A single strawberry isn't actually a berry, but a banana is!",
  "French fries were actually invented in Belgium, not France!",
  "Popcorn has been around for over 5,000 years, loved by ancient civilizations!"
]

function scoreTone(score: number) {
  if (score >= 80) return 'bg-emerald-500 text-white shadow-[4px_4px_0_#064e3b]'
  if (score >= 60) return 'bg-lime-400 text-slate-950 shadow-[4px_4px_0_#365314]'
  if (score >= 40) return 'bg-amber-400 text-slate-950 shadow-[4px_4px_0_#78350f]'
  return 'bg-rose-500 text-white shadow-[4px_4px_0_#991b1b]'
}

function scoreBorder(score: number) {
  if (score >= 80) return 'border-emerald-600'
  if (score >= 60) return 'border-lime-500'
  if (score >= 40) return 'border-amber-500'
  return 'border-rose-500'
}

function scoreText(score: number) {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-lime-600'
  if (score >= 40) return 'text-amber-600'
  return 'text-rose-600'
}

function nutritionChart(product?: Product) {
  const n = product?.nutrition || {}
  return [
    { name: 'Sugar', value: n.sugar || 0, fill: '#fb7185' },
    { name: 'Protein', value: n.protein || 0, fill: '#22c55e' },
    { name: 'Fiber', value: n.fiber || 0, fill: '#84cc16' },
    { name: 'Fat', value: n.fat || 0, fill: '#f59e0b' },
    { name: 'Salt', value: n.salt || 0, fill: '#38bdf8' },
  ]
}

// Custom simple Retro Sound Synthesizer using Web Audio API
class AudioSynth {
  private ctx: AudioContext | null = null
  public enabled: boolean = true

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
  }

  playScan() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(440, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15)
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.15)
  }

  playSuccess() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return
    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(523.25, now) // C5
    osc.frequency.setValueAtTime(659.25, now + 0.08) // E5
    osc.frequency.setValueAtTime(783.99, now + 0.16) // G5
    osc.frequency.setValueAtTime(1046.50, now + 0.24) // C6
    gain.gain.setValueAtTime(0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start()
    osc.stop(now + 0.4)
  }

  playWarning() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return
    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(220, now) // A3
    osc.frequency.linearRampToValueAtTime(110, now + 0.35) // A2
    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start()
    osc.stop(now + 0.35)
  }

  playPop() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(300, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.08)
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08)
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start()
    osc.stop(this.ctx.currentTime + 0.08)
  }

  playBattle() {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return
    const now = this.ctx.currentTime
    // Play a dual sweep for epic battle start
    const osc1 = this.ctx.createOscillator()
    const osc2 = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc1.type = 'triangle'
    osc1.frequency.setValueAtTime(150, now)
    osc1.frequency.linearRampToValueAtTime(450, now + 0.3)

    osc2.type = 'sawtooth'
    osc2.frequency.setValueAtTime(120, now)
    osc2.frequency.exponentialRampToValueAtTime(600, now + 0.3)

    gain.gain.setValueAtTime(0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(this.ctx.destination)

    osc1.start()
    osc2.start()
    osc1.stop(now + 0.35)
    osc2.stop(now + 0.35)
  }
}

const synth = new AudioSynth()

interface FoodMascotProps {
  score?: number
  speechBubbleText?: string
  onClickMascot?: () => void
}

function FoodMascot({ score, speechBubbleText, onClickMascot }: FoodMascotProps) {
  // Determine facial expression based on the score
  let eyeStyle = "👁️  👁️"
  let mouthStyle = "👄"
  let faceColor = "bg-emerald-400"
  let expressionName = "Happy Mascot"

  if (score !== undefined) {
    if (score >= 80) {
      eyeStyle = "🤩  🤩"
      mouthStyle = "😋"
      faceColor = "bg-emerald-400"
      expressionName = "Excited!"
    } else if (score >= 60) {
      eyeStyle = "😊  😊"
      mouthStyle = "😀"
      faceColor = "bg-lime-300"
      expressionName = "Cheerful"
    } else if (score >= 40) {
      eyeStyle = "🤔  🤔"
      mouthStyle = "😐"
      faceColor = "bg-amber-300"
      expressionName = "Thinking..."
    } else {
      eyeStyle = "😰  😰"
      mouthStyle = "🤢"
      faceColor = "bg-rose-400"
      expressionName = "Shocked!"
    }
  } else {
    // Default playful
    eyeStyle = "🟢  🟢"
    mouthStyle = "👅"
    faceColor = "bg-amber-400 animate-pulse"
    expressionName = "Playful Friend"
  }

  return (
    <div className="relative mx-auto h-56 w-full max-w-sm flex flex-col items-center justify-end">
      {/* Speech Bubble */}
      <AnimatePresence mode="wait">
        {speechBubbleText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -5 }}
            className="absolute top-0 z-20 max-w-[85%] rounded-2xl border-2 border-slate-900 bg-white px-4 py-2 text-xs font-800 text-slate-800 shadow-[4px_4px_0_#0f172a] after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:border-t-[10px] after:border-t-slate-900 after:border-x-[8px] after:border-x-transparent"
          >
            {speechBubbleText}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
        whileTap={{ scale: 0.95 }}
        onClick={onClickMascot}
        className="cursor-pointer relative z-10 flex flex-col items-center justify-end w-48 h-36"
      >
        {/* Floating food items surrounding the mascot */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-red-400 text-white shadow-md border border-slate-900"
        >
          <Apple size={20} />
        </motion.div>
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.3, ease: "easeInOut" }}
          className="absolute right-0 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-amber-300 text-amber-950 shadow-md border border-slate-900"
        >
          <Cherry size={18} />
        </motion.div>
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="absolute left-6 bottom-4 flex h-9 w-9 items-center justify-center rounded-full bg-orange-400 text-orange-950 shadow-md border border-slate-900"
        >
          <Carrot size={18} />
        </motion.div>

        {/* Mascot Face Body */}
        <div className={`relative flex flex-col items-center justify-center w-28 h-28 rounded-full border-4 border-slate-900 shadow-[6px_6px_0_#0f172a] ${faceColor} transition-colors duration-500`}>
          {/* Blush */}
          <div className="absolute left-2 top-14 w-3 h-2 rounded-full bg-rose-300 opacity-60" />
          <div className="absolute right-2 top-14 w-3 h-2 rounded-full bg-rose-300 opacity-60" />
          
          {/* Eyes */}
          <div className="text-xl font-bold select-none">{eyeStyle}</div>
          {/* Mouth */}
          <div className="text-2xl mt-1 select-none">{mouthStyle}</div>

          {/* Little green leaf hat */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 rotate-12 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-emerald-950 border border-slate-900 shadow">
            <Leaf size={12} />
          </div>
        </div>

        {/* Cute Mascot Shadow */}
        <div className="h-3 w-24 rounded-full bg-orange-200/70 blur-sm mt-2" />
      </motion.div>
    </div>
  )
}

export default function PureScanPage() {
  const [barcode, setBarcode] = useState('3017620422003')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cameraOpen, setCameraOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  // Showcase Fact / Speech
  const [speechBubble, setSpeechBubble] = useState("Hey there! Tap me to learn a fun food fact! 🍎💡")
  
  // Snack Showdown (Compare Mode)
  const [isShowdown, setIsShowdown] = useState(false)
  const [barcode2, setBarcode2] = useState('737628064502')
  const [result2, setResult2] = useState<ScanResult | null>(null)
  const [loading2, setLoading2] = useState(false)
  const [battleWinner, setBattleWinner] = useState<'p1' | 'p2' | 'draw' | null>(null)
  const [sparkleArray, setSparkleArray] = useState<{ id: number; left: number; top: number }[]>([])

  // Recent History
  const [recentScans, setRecentScans] = useState<any[]>([])

  const [profile, setProfile] = useState<Profile>({
    goal: 'general_health',
    allergies: ['milk'],
    diet: 'balanced',
    condition: 'diabetes',
  })
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Fetch recent scans on load
  const fetchRecentScans = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/scans/recent`)
      if (response.ok) {
        const data = await response.json()
        if (data.scans) {
          setRecentScans(data.scans)
        }
      }
    } catch (e) {
      console.warn("Failed to fetch recent scans:", e)
    }
  }

  useEffect(() => {
    fetchRecentScans()
  }, [])

  // Toggle sound setting
  const toggleSound = () => {
    const nextVal = !soundEnabled
    setSoundEnabled(nextVal)
    synth.enabled = nextVal
    if (nextVal) {
      synth.playPop()
    }
  }

  // Mascot Click
  const handleMascotClick = () => {
    synth.playPop()
    const randomIndex = Math.floor(Math.random() * mascotFacts.length)
    setSpeechBubble(mascotFacts[randomIndex])
    
    // Clear bubble after 7 seconds
    setTimeout(() => {
      setSpeechBubble("")
    }, 7000)
  }

  // Show confetti/sparkles for good health score
  const triggerSparkles = () => {
    const arr = Array.from({ length: 20 }).map((_, i) => ({
      id: Math.random() + i,
      left: Math.random() * 100,
      top: Math.random() * 80 + 10,
    }))
    setSparkleArray(arr)
    setTimeout(() => setSparkleArray([]), 2500)
  }

  // Main analyze function for P1
  async function analyze(nextBarcode = barcode) {
    const clean = nextBarcode.trim()
    if (!clean) {
      setError('Enter or scan a barcode first.')
      return
    }

    setLoading(true)
    setError('')
    synth.playScan()
    try {
      const response = await fetch(`${API_URL}/api/products/barcode/${clean}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to analyze this product.')
      
      setResult(data)
      setBarcode(clean)
      
      // Play matching tone & set mascot expression
      const score = data.analysis.health_score
      if (score >= 60) {
        synth.playSuccess()
        triggerSparkles()
        setSpeechBubble(`Yum! That score looks amazing: ${score}/100! 😍`)
      } else {
        synth.playWarning()
        setSpeechBubble(`Yikes, scored ${score}/100. Check the warnings! 😰`)
      }

      fetchRecentScans() // refresh history
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
      synth.playWarning()
    } finally {
      setLoading(false)
    }
  }

  // Dual Battle Analyze
  async function runBattle() {
    const c1 = barcode.trim()
    const c2 = barcode2.trim()

    if (!c1 || !c2) {
      setError('Both barcodes are needed for a Snack Showdown!')
      return
    }

    setLoading(true)
    setLoading2(true)
    setError('')
    setBattleWinner(null)
    setResult(null)
    setResult2(null)
    synth.playBattle()

    let p1Data: ScanResult | null = null
    let p2Data: ScanResult | null = null

    try {
      // Analyze P1
      const res1 = await fetch(`${API_URL}/api/products/barcode/${c1}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      })
      if (res1.ok) {
        p1Data = await res1.json()
        setResult(p1Data)
      } else {
        throw new Error("Unable to fetch data for Player 1")
      }

      // Analyze P2
      const res2 = await fetch(`${API_URL}/api/products/barcode/${c2}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      })
      if (res2.ok) {
        p2Data = await res2.json()
        setResult2(p2Data)
      } else {
        throw new Error("Unable to fetch data for Player 2")
      }

      if (p1Data && p2Data) {
        const s1 = p1Data.analysis.health_score
        const s2 = p2Data.analysis.health_score

        if (s1 > s2) {
          setBattleWinner('p1')
          synth.playSuccess()
          triggerSparkles()
          setSpeechBubble(`🏆 Brand "${p1Data.product.brand}" WINS the Showdown! Neato!`)
        } else if (s2 > s1) {
          setBattleWinner('p2')
          synth.playSuccess()
          triggerSparkles()
          setSpeechBubble(`🏆 Brand "${p2Data.product.brand}" WINS the Showdown! Awesome!`)
        } else {
          setBattleWinner('draw')
          synth.playSuccess()
          setSpeechBubble("🤝 An absolute Draw! Healthy snacks all around!")
        }
      }

      fetchRecentScans()
    } catch (err: any) {
      setError(err.message || 'Something went wrong during battle.')
      synth.playWarning()
    } finally {
      setLoading(false)
      setLoading2(false)
    }
  }

  async function openCamera() {
    setError('')
    if (!window.BarcodeDetector) {
      setError('Camera barcode detection is not supported in this browser. Use manual entry for now.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      setCameraOpen(true)
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      setError('Camera permission was blocked. Manual barcode input still works.')
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraOpen(false)
  }

  useEffect(() => {
    if (!cameraOpen || !videoRef.current || !window.BarcodeDetector) return

    let cancelled = false
    const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code'] })

    async function tick() {
      if (cancelled || !videoRef.current) return
      try {
        const codes = await detector.detect(videoRef.current)
        if (codes?.[0]?.rawValue) {
          const detected = codes[0].rawValue
          synth.playScan()
          setBarcode(detected)
          closeCamera()
          analyze(detected)
          return
        }
      } catch {
        // Camera support varies by browser.
      }
      requestAnimationFrame(tick)
    }

    tick()
    return () => {
      cancelled = true
    }
  }, [cameraOpen])

  const product = result?.product
  const analysis = result?.analysis

  const product2 = result2?.product
  const analysis2 = result2?.analysis

  // Mascot dynamic average score
  let currentDisplayScore = undefined
  if (analysis && !isShowdown) {
    currentDisplayScore = analysis.health_score
  } else if (analysis && analysis2 && isShowdown) {
    currentDisplayScore = Math.round((analysis.health_score + analysis2.health_score) / 2)
  }

  return (
    <main className="min-h-screen bg-[#fff8e8] text-slate-900 relative overflow-hidden pb-10">
      {/* Dynamic Sparkles Floating */}
      <AnimatePresence>
        {sparkleArray.map((sp) => (
          <motion.div
            key={sp.id}
            initial={{ scale: 0, opacity: 1, rotate: 0 }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [1, 1, 0],
              y: -100,
              rotate: 360,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              position: 'absolute',
              left: `${sp.left}%`,
              top: `${sp.top}%`,
              pointerEvents: 'none',
              zIndex: 99,
            }}
            className="text-amber-400"
          >
            <Sparkle fill="#f59e0b" size={24} />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_16px_16px,#fed7aa_2px,transparent_2px)] bg-[size:34px_34px] opacity-60" />
      <div className="fixed inset-x-0 top-0 h-56 bg-gradient-to-b from-[#b8f7d4] via-[#fff3b0] to-transparent pointer-events-none" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        
        {/* Navigation Bar */}
        <nav className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-slate-900 bg-white px-4 py-3 shadow-[6px_6px_0_#0f172a]">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="flex h-11 w-11 items-center justify-center rounded-md bg-lime-300 text-slate-950 ring-2 ring-slate-900 shadow-[2px_2px_0_#0f172a]"
            >
              <Soup size={24} />
            </motion.div>
            <div>
              <div className="font-display text-2xl font-900 tracking-tight">PureScan</div>
              <div className="text-xs font-800 uppercase tracking-wide text-emerald-700">Playful food intelligence</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className={`flex items-center gap-1.5 rounded-full border-2 border-slate-900 px-3 py-2 text-xs font-800 transition shadow-[2px_2px_0_#0f172a] active:translate-y-0.5 ${
                soundEnabled ? 'bg-amber-300 text-slate-950' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              {soundEnabled ? 'Sound On' : 'Muted'}
            </button>

            <div className="flex items-center gap-2 rounded-full border-2 border-slate-900 bg-orange-200 px-4 py-2 text-xs font-800 text-slate-950 shadow-[2px_2px_0_#0f172a]">
              <Sparkles size={15} className="animate-spin text-amber-600" />
              Scan. Snack. Decide.
            </div>
          </div>
        </nav>

        {/* Dashboard Grid */}
        <section className="grid gap-5 lg:grid-cols-[390px_1fr]">
          
          {/* Sidebar Area */}
          <aside className="rounded-lg border-2 border-slate-900 bg-white p-5 shadow-[8px_8px_0_#0f172a] flex flex-col justify-between">
            <div>
              {/* Responsive interactive Mascot */}
              <FoodMascot
                score={currentDisplayScore}
                speechBubbleText={speechBubble}
                onClickMascot={handleMascotClick}
              />
              
              <div className="my-5 text-center lg:text-left">
                <h1 className="font-display text-4xl font-900 leading-[0.98] tracking-tight text-slate-900">
                  What is hiding in your snack?
                </h1>
                <p className="mt-3 text-sm font-700 leading-6 text-slate-600">
                  Drop in a barcode and PureScan turns nutrition labels, additives, and allergens into a quick food verdict.
                </p>
              </div>

              {/* Mode Selector */}
              <div className="grid grid-cols-2 gap-2 mb-4 border-2 border-slate-900 p-1 rounded-lg bg-slate-100">
                <button
                  onClick={() => {
                    synth.playPop()
                    setIsShowdown(false)
                    setResult2(null)
                    setBattleWinner(null)
                  }}
                  className={`py-2 text-xs font-900 rounded transition uppercase ${
                    !isShowdown ? 'bg-lime-300 text-slate-950 border-2 border-slate-900 shadow-[2px_2px_0_#0f172a]' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🔍 Single Scan
                </button>
                <button
                  onClick={() => {
                    synth.playPop()
                    setIsShowdown(true)
                  }}
                  className={`py-2 text-xs font-900 rounded transition uppercase flex items-center justify-center gap-1 ${
                    isShowdown ? 'bg-amber-300 text-slate-950 border-2 border-slate-900 shadow-[2px_2px_0_#0f172a]' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Swords size={12} className="text-amber-700" />
                  Snack Showdown
                </button>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-800 uppercase tracking-wide text-slate-500">
                    {isShowdown ? '🚨 Snack Player 1 Barcode' : 'Barcode kitchen counter'}
                  </span>
                  <div className="flex gap-2">
                    <input
                      value={barcode}
                      onChange={(event) => setBarcode(event.target.value)}
                      placeholder="Enter barcode 1"
                      className="min-w-0 flex-1 rounded-md border-2 border-slate-900 bg-[#fffdf7] px-3 py-2.5 text-sm font-800 text-slate-900 outline-none transition focus:bg-lime-50"
                    />
                    {!isShowdown && (
                      <>
                        <button
                          onClick={() => analyze()}
                          disabled={loading}
                          className="flex h-11 w-11 items-center justify-center rounded-md border-2 border-slate-900 bg-lime-300 text-slate-950 transition hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-60 shadow-[2px_2px_0_#0f172a] active:shadow-none"
                          title="Analyze barcode"
                        >
                          {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        </button>
                        <button
                          onClick={openCamera}
                          className="flex h-11 w-11 items-center justify-center rounded-md border-2 border-slate-900 bg-sky-200 text-slate-950 transition hover:translate-x-0.5 hover:translate-y-0.5 shadow-[2px_2px_0_#0f172a] active:shadow-none"
                          title="Open camera scanner"
                        >
                          <Camera size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </label>

                {/* Second input if in Showdown Mode */}
                {isShowdown && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="block"
                  >
                    <span className="mb-2 block text-xs font-800 uppercase tracking-wide text-slate-500">
                      ⚔️ Snack Player 2 Barcode
                    </span>
                    <div className="flex gap-2">
                      <input
                        value={barcode2}
                        onChange={(event) => setBarcode2(event.target.value)}
                        placeholder="Enter barcode 2"
                        className="min-w-0 flex-1 rounded-md border-2 border-slate-900 bg-[#fffdf7] px-3 py-2.5 text-sm font-800 text-slate-900 outline-none transition focus:bg-amber-50"
                      />
                    </div>

                    <button
                      onClick={runBattle}
                      disabled={loading || loading2}
                      className="mt-4 flex w-full h-11 items-center justify-center gap-2 rounded-md border-2 border-slate-900 bg-rose-400 text-slate-950 font-900 text-sm shadow-[3px_3px_0_#0f172a] hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-none transition disabled:opacity-60"
                    >
                      {loading || loading2 ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          <Swords size={16} />
                          FIGHT SNACKS!
                        </>
                      )}
                    </button>
                  </motion.div>
                )}

                {/* Sample Buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed border-slate-200">
                  <span className="text-[10px] w-full font-800 uppercase tracking-wider text-slate-400">Try these demo snack codes:</span>
                  {sampleBarcodes.map((code) => (
                    <button
                      key={code}
                      onClick={() => {
                        if (isShowdown) {
                          // set player 1 if empty, else player 2
                          if (!barcode) setBarcode(code)
                          else setBarcode2(code)
                        } else {
                          analyze(code)
                        }
                      }}
                      className="rounded-full border-2 border-slate-900 bg-amber-200 px-3 py-1 text-xs font-800 text-slate-950 transition hover:bg-amber-300 shadow-[2px_2px_0_#0f172a]"
                    >
                      {code}
                    </button>
                  ))}
                </div>

                {/* Preferences Drawer */}
                <div className="rounded-lg border-2 border-slate-900 bg-[#f0fff4] p-4 shadow-[4px_4px_0_#14532d]">
                  <div className="mb-3 flex items-center gap-2 text-sm font-900">
                    <ChefHat size={17} className="text-emerald-700" />
                    Your Food Profile Fit
                  </div>
                  <div className="grid gap-3">
                    <select
                      value={profile.goal}
                      onChange={(event) => setProfile({ ...profile, goal: event.target.value })}
                      className="rounded-md border-2 border-slate-900 bg-white px-3 py-2 text-xs font-800 outline-none"
                    >
                      <option value="general_health">🎯 General health</option>
                      <option value="weight_loss">🔥 Weight loss</option>
                      <option value="muscle_gain">💪 Muscle gain</option>
                    </select>
                    <select
                      value={profile.condition}
                      onChange={(event) => setProfile({ ...profile, condition: event.target.value })}
                      className="rounded-md border-2 border-slate-900 bg-white px-3 py-2 text-xs font-800 outline-none"
                    >
                      <option value="none">🩺 No medical preference</option>
                      <option value="diabetes">🩺 Diabetes-friendly</option>
                      <option value="hypertension">🩺 Low sodium / BP</option>
                    </select>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {allergyOptions.map(({ value, icon: Icon }) => {
                      const active = profile.allergies.includes(value)
                      return (
                        <button
                          key={value}
                          onClick={() => {
                            synth.playPop()
                            setProfile({
                              ...profile,
                              allergies: active
                                ? profile.allergies.filter((item) => item !== value)
                                : [...profile.allergies, value],
                            })
                          }}
                          className={`flex items-center gap-1 rounded-full border border-slate-900 px-2.5 py-1 text-[11px] font-800 transition ${
                            active ? 'bg-rose-300 text-slate-950 shadow-[1px_1px_0_#000]' : 'bg-white text-slate-700 hover:bg-lime-50'
                          }`}
                        >
                          <Icon size={11} />
                          {value}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex gap-2 rounded-md border-2 border-rose-600 bg-rose-100 p-3 text-sm font-800 text-rose-700 shadow-[3px_3px_0_#991b1b]"
                  >
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Micro-Branded Footer info */}
            <div className="mt-6 pt-4 border-t border-dashed border-slate-200 text-center">
              <span className="text-[10px] font-800 tracking-widest text-slate-400 uppercase">
                PureScan V2.0 • Playful AI
              </span>
            </div>
          </aside>

          {/* Main Results / Playground Area */}
          <section className="grid gap-5">
            {cameraOpen && (
              <div className="rounded-lg border-2 border-slate-900 bg-white p-4 shadow-[6px_6px_0_#0f172a]">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-800">
                    <Barcode size={17} className="text-emerald-700 animate-pulse" />
                    Live barcode scanner active
                  </div>
                  <button onClick={closeCamera} className="rounded-md border-2 border-slate-900 bg-rose-200 p-2 text-slate-950 shadow-[2px_2px_0_#0f172a] active:translate-y-0.5">
                    <X size={16} />
                  </button>
                </div>
                <video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full rounded-md bg-black object-cover border-2 border-slate-900" />
              </div>
            )}

            {/* Standard Mode Display */}
            {!isShowdown && (
              <>
                {!result && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid min-h-[560px] gap-5 rounded-lg border-2 border-slate-900 bg-white p-5 shadow-[8px_8px_0_#0f172a] xl:grid-cols-[1fr_300px]"
                  >
                    <div className="flex flex-col justify-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-md border-2 border-slate-900 bg-lime-300 shadow-[3px_3px_0_#0f172a]">
                        <Barcode size={34} />
                      </div>
                      <h2 className="font-display text-4xl font-900 leading-tight">Your playful food report will appear here.</h2>
                      <p className="mt-4 max-w-xl text-base font-700 leading-7 text-slate-600">
                        Try a sample barcode to see a product card, health score, food warnings, nutrition bars, and additive notes.
                      </p>
                      
                      <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        {[
                          ['Nutrition 🍎', 'Sugar, protein, fiber, fat analysis'],
                          ['Additives 🧪', 'Sweeteners, dyes, preservatives flagged'],
                          ['Diet Fit 👤', 'Custom allergies and health profiles'],
                        ].map(([title, copy]) => (
                          <div key={title} className="rounded-md border-2 border-slate-900 bg-[#fff8e8] p-3 shadow-[3px_3px_0_#000]">
                            <div className="font-display text-lg font-900">{title}</div>
                            <div className="mt-1 text-xs font-700 leading-5 text-slate-500">{copy}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-center rounded-lg bg-gradient-to-br from-orange-200 via-lime-200 to-sky-200 p-4 border-2 border-slate-900 relative">
                      <div className="absolute top-2 right-2 text-xs font-900 bg-white border border-slate-900 rounded px-2 py-1 shadow">
                        NEOBRUTALISM UI
                      </div>
                      <FoodMascot />
                    </div>
                  </motion.div>
                )}

                {/* Normal single product results */}
                {result && analysis && product && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-5">
                    
                    {/* Header Card */}
                    <div className="grid gap-5 rounded-lg border-2 border-slate-900 bg-white p-5 shadow-[8px_8px_0_#0f172a] xl:grid-cols-[1fr_280px]">
                      <div className="flex gap-4 items-start">
                        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-md border-2 border-slate-900 bg-[#fffdf7] shadow-[2px_2px_0_#0f172a]">
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
                          ) : (
                            <Soup className="text-slate-400" size={42} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-900 uppercase tracking-wide text-emerald-700">{product.brand}</div>
                          <h2 className="mt-1 font-display text-3xl font-900 leading-tight text-slate-900">{product.name}</h2>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full border-2 border-slate-900 bg-sky-100 px-3 py-1 font-800 shadow-[1px_1px_0_#000]">Barcode {product.barcode}</span>
                            {(product.allergens || []).slice(0, 4).map((item) => (
                              <span key={item} className="rounded-full border-2 border-rose-500 bg-rose-100 px-3 py-1 font-800 text-rose-700 shadow-[1px_1px_0_#000]">{item}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className={`rounded-lg border-2 border-slate-900 p-4 text-center ${scoreTone(analysis.health_score)}`}>
                        <div className="text-xs font-900 uppercase tracking-wider">Health Score</div>
                        <div className="mt-1 font-display text-6xl font-900 tracking-tighter">{analysis.health_score}</div>
                        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-900 bg-slate-900/10 rounded py-1 px-2">
                          <ShieldAlert size={14} />
                          {analysis.risk_level}
                        </div>
                      </div>
                    </div>

                    {/* Verdict */}
                    <div className="rounded-lg border-2 border-slate-900 bg-[#fffdf7] p-5 shadow-[6px_6px_0_#0f172a]">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border-2 border-slate-900 bg-lime-300 shadow-[2px_2px_0_#0f172a]">
                          <Sparkles size={22} />
                        </div>
                        <div>
                          <h3 className="font-display text-xl font-900">Food Verdict</h3>
                          <p className="mt-1 text-sm font-700 leading-6 text-slate-700">{analysis.recommendation}</p>
                        </div>
                      </div>
                    </div>

                    {/* Warnings and Positives */}
                    <div className="grid gap-5 xl:grid-cols-2">
                      <div className="rounded-lg border-2 border-slate-900 bg-white p-5 shadow-[6px_6px_0_#0f172a]">
                        <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-900">
                          <AlertTriangle size={20} className="text-rose-600 animate-bounce" />
                          Watch-outs
                        </h3>
                        <div className="space-y-3">
                          {analysis.warnings.length ? analysis.warnings.map((warning) => (
                            <div key={warning} className="rounded-md border-2 border-rose-500 bg-rose-100 p-3 text-xs font-900 text-rose-700 shadow-[2px_2px_0_#000]">
                              {warning}
                            </div>
                          )) : (
                            <div className="rounded-md border-2 border-emerald-500 bg-emerald-100 p-3 text-xs font-900 text-emerald-700">
                              🌱 No major warnings from available data.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-lg border-2 border-slate-900 bg-white p-5 shadow-[6px_6px_0_#0f172a]">
                        <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-900">
                          <BadgeCheck size={20} className={scoreText(analysis.health_score)} />
                          Good bites
                        </h3>
                        <div className="space-y-3">
                          {analysis.positives.length ? analysis.positives.map((positive) => (
                            <div key={positive} className="rounded-md border-2 border-emerald-500 bg-emerald-100 p-3 text-xs font-900 text-emerald-700 shadow-[2px_2px_0_#000]">
                              {positive}
                            </div>
                          )) : (
                            <div className="rounded-md border-2 border-slate-900 bg-slate-50 p-3 text-xs font-900 text-slate-500">
                              No strong positive nutrition signal found yet.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Chart and Additives */}
                    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                      <div className="rounded-lg border-2 border-slate-900 bg-white p-5 shadow-[6px_6px_0_#0f172a]">
                        <h3 className="mb-4 font-display text-xl font-900">Nutrition Playground per 100g</h3>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={nutritionChart(product)}>
                              <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                              <XAxis dataKey="name" stroke="#475569" fontSize={11} fontWeight={900} />
                              <YAxis stroke="#475569" fontSize={11} fontWeight={900} />
                              <Tooltip cursor={{ fill: 'rgba(235, 255, 235, 0.4)' }} />
                              <Bar dataKey="value" radius={[6, 6, 0, 0]} stroke="#000" strokeWidth={1.5} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="rounded-lg border-2 border-slate-900 bg-white p-5 shadow-[6px_6px_0_#0f172a]">
                        <h3 className="mb-4 font-display text-xl font-900">Additive Radar</h3>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                          {analysis.risky_ingredients.length ? analysis.risky_ingredients.map((item) => (
                            <div key={item.ingredient} className="rounded-md border-2 border-slate-900 bg-orange-100 p-3 shadow-[2px_2px_0_#000]">
                              <div className="flex items-center justify-between gap-3">
                                <div className="font-900 capitalize text-sm">{item.ingredient}</div>
                                <div className="rounded-full border border-slate-900 bg-rose-200 px-2 py-0.5 text-[10px] font-900 uppercase">{item.risk_level}</div>
                              </div>
                              <p className="mt-2 text-xs font-700 leading-5 text-slate-600">{item.reason}</p>
                            </div>
                          )) : (
                            <div className="rounded-md border-2 border-slate-900 bg-lime-100 p-3 text-sm font-900 text-emerald-800">
                              🔬 No flagged additives from the current rule set.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ingredients trail */}
                    <div className="rounded-lg border-2 border-slate-900 bg-white p-5 shadow-[6px_6px_0_#0f172a]">
                      <h3 className="mb-3 font-display text-xl font-900">Ingredient Trail</h3>
                      <p className="text-sm font-700 leading-6 text-slate-600">
                        {product.ingredientsText || product.ingredients?.join(', ') || 'Ingredient list not available for this product.'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {/* Showdown Compare Mode Display */}
            {isShowdown && (
              <div className="grid gap-5">
                
                {/* Battle Intro Board */}
                {(!result || !result2) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-lg border-4 border-slate-900 bg-white p-6 text-center shadow-[10px_10px_0_#0f172a]"
                  >
                    <div className="flex justify-center mb-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-400 border-2 border-slate-900 shadow-[3px_3px_0_#000] text-white">
                        <Swords size={32} />
                      </div>
                    </div>
                    <h2 className="font-display text-4xl font-900 tracking-tight">Snack Showdown Battle Arena!</h2>
                    <p className="mt-3 text-slate-600 font-700 max-w-xl mx-auto text-sm leading-6">
                      Input two snack barcodes in the left sidebar and tap <b>FIGHT SNACKS!</b> to run a side-by-side gamified health comparison.
                    </p>
                    
                    <div className="mt-6 flex flex-wrap gap-4 justify-center items-center">
                      <div className="bg-lime-100 border-2 border-slate-900 p-3 rounded shadow-[2px_2px_0_#000] text-xs font-800">
                        🏆 Winner Highlighted
                      </div>
                      <div className="bg-sky-100 border-2 border-slate-900 p-3 rounded shadow-[2px_2px_0_#000] text-xs font-800">
                        📊 Parameter Breakdown
                      </div>
                      <div className="bg-orange-100 border-2 border-slate-900 p-3 rounded shadow-[2px_2px_0_#000] text-xs font-800">
                        🔊 Sound Effects & Confetti
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Showdown Battle Result Cards */}
                {result && result2 && product && product2 && analysis && analysis2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid gap-5"
                  >
                    
                    {/* The Duel Cards */}
                    <div className="grid md:grid-cols-2 gap-5 relative">
                      
                      {/* VS Overlay badge */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border-4 border-white text-white font-black text-2xl h-14 w-14 rounded-full flex items-center justify-center shadow-lg z-20 rotate-[-12deg] tracking-widest hidden md:flex">
                        VS
                      </div>

                      {/* Card Player 1 */}
                      <motion.div
                        animate={battleWinner === 'p1' ? { scale: [1, 1.03, 1] } : {}}
                        transition={{ repeat: battleWinner === 'p1' ? Infinity : 0, duration: 1.5 }}
                        className={`rounded-lg border-4 bg-white p-5 shadow-[8px_8px_0_#000] transition-all relative ${
                          battleWinner === 'p1' ? 'border-amber-400 bg-amber-50/20' : 'border-slate-900'
                        }`}
                      >
                        {battleWinner === 'p1' && (
                          <div className="absolute -top-6 left-4 bg-amber-400 text-slate-950 border-2 border-slate-900 rounded px-2.5 py-1 text-xs font-900 uppercase flex items-center gap-1 shadow-[2px_2px_0_#000] z-10 animate-bounce">
                            <Crown size={13} fill="#000" /> Winner
                          </div>
                        )}
                        
                        <div className="flex gap-3">
                          <div className="w-20 h-20 bg-[#fffdf7] border-2 border-slate-900 rounded shrink-0 overflow-hidden flex items-center justify-center">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
                            ) : (
                              <Soup size={30} className="text-slate-400" />
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] font-900 text-slate-400 uppercase">{product.brand}</span>
                            <h4 className="font-display font-900 text-lg leading-tight line-clamp-2">{product.name}</h4>
                            <span className="text-[9px] font-900 bg-slate-200 border border-slate-900 px-2 py-0.5 rounded inline-block mt-2">
                              {product.barcode}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
                          <span className="text-xs font-800 text-slate-500">Showdown Score:</span>
                          <span className={`px-4 py-1.5 border-2 border-slate-900 font-display font-950 text-2xl rounded ${scoreTone(analysis.health_score)}`}>
                            {analysis.health_score}/100
                          </span>
                        </div>
                      </motion.div>

                      {/* Card Player 2 */}
                      <motion.div
                        animate={battleWinner === 'p2' ? { scale: [1, 1.03, 1] } : {}}
                        transition={{ repeat: battleWinner === 'p2' ? Infinity : 0, duration: 1.5 }}
                        className={`rounded-lg border-4 bg-white p-5 shadow-[8px_8px_0_#000] transition-all relative ${
                          battleWinner === 'p2' ? 'border-amber-400 bg-amber-50/20' : 'border-slate-900'
                        }`}
                      >
                        {battleWinner === 'p2' && (
                          <div className="absolute -top-6 left-4 bg-amber-400 text-slate-950 border-2 border-slate-900 rounded px-2.5 py-1 text-xs font-900 uppercase flex items-center gap-1 shadow-[2px_2px_0_#000] z-10 animate-bounce">
                            <Crown size={13} fill="#000" /> Winner
                          </div>
                        )}
                        
                        <div className="flex gap-3">
                          <div className="w-20 h-20 bg-[#fffdf7] border-2 border-slate-900 rounded shrink-0 overflow-hidden flex items-center justify-center">
                            {product2.imageUrl ? (
                              <img src={product2.imageUrl} alt={product2.name} className="h-full w-full object-contain" />
                            ) : (
                              <Soup size={30} className="text-slate-400" />
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] font-900 text-slate-400 uppercase">{product2.brand}</span>
                            <h4 className="font-display font-900 text-lg leading-tight line-clamp-2">{product2.name}</h4>
                            <span className="text-[9px] font-900 bg-slate-200 border border-slate-900 px-2 py-0.5 rounded inline-block mt-2">
                              {product2.barcode}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
                          <span className="text-xs font-800 text-slate-500">Showdown Score:</span>
                          <span className={`px-4 py-1.5 border-2 border-slate-900 font-display font-950 text-2xl rounded ${scoreTone(analysis2.health_score)}`}>
                            {analysis2.health_score}/100
                          </span>
                        </div>
                      </motion.div>

                    </div>

                    {/* Battle Parameter Comparison Board */}
                    <div className="rounded-lg border-2 border-slate-900 bg-white p-5 shadow-[6px_6px_0_#000]">
                      <h3 className="font-display font-900 text-xl mb-4 text-center">📊 Nutritional Battle Breakdown</h3>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm font-800">
                          <thead>
                            <tr className="border-b-2 border-slate-900 bg-slate-50">
                              <th className="py-2 text-left px-2">Nutritional Stat</th>
                              <th className="py-2 text-center bg-lime-100/50">{product.name.slice(0, 15)}...</th>
                              <th className="py-2 text-center bg-amber-100/50">{product2.name.slice(0, 15)}...</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              ['Health Score', analysis.health_score, analysis2.health_score, true],
                              ['Sugars (g)', product.nutrition.sugar ?? 0, product2.nutrition.sugar ?? 0, false],
                              ['Saturated Fat (g)', product.nutrition.saturatedFat ?? 0, product2.nutrition.saturatedFat ?? 0, false],
                              ['Fibers (g)', product.nutrition.fiber ?? 0, product2.nutrition.fiber ?? 0, true],
                              ['Proteins (g)', product.nutrition.protein ?? 0, product2.nutrition.protein ?? 0, true],
                              ['Salt (g)', product.nutrition.salt ?? 0, product2.nutrition.salt ?? 0, false],
                            ].map(([label, v1, v2, higherIsBetter]) => {
                              const value1 = Number(v1)
                              const value2 = Number(v2)
                              const winnerP1 = higherIsBetter ? value1 > value2 : value1 < value2
                              const winnerP2 = higherIsBetter ? value2 > value1 : value2 < value1
                              const tie = value1 === value2

                              return (
                                <tr key={label as string} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                  <td className="py-2.5 px-2 font-bold">{label as string}</td>
                                  
                                  {/* Player 1 Value */}
                                  <td className={`py-2.5 text-center transition-colors ${
                                    winnerP1 ? 'bg-emerald-100 font-extrabold text-emerald-800' : tie ? 'bg-slate-50 text-slate-600' : 'bg-rose-50 text-rose-500'
                                  }`}>
                                    {value1.toFixed(1)} {winnerP1 && '🏆'}
                                  </td>

                                  {/* Player 2 Value */}
                                  <td className={`py-2.5 text-center transition-colors ${
                                    winnerP2 ? 'bg-emerald-100 font-extrabold text-emerald-800' : tie ? 'bg-slate-50 text-slate-600' : 'bg-rose-50 text-rose-500'
                                  }`}>
                                    {value2.toFixed(1)} {winnerP2 && '🏆'}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Shared Recommendations / Verdict Battle Recap */}
                    <div className="grid gap-5 xl:grid-cols-2">
                      <div className="rounded-lg border-2 border-slate-900 bg-white p-4 shadow-[4px_4px_0_#000]">
                        <h4 className="font-black text-sm mb-2">{product.name} Verdict</h4>
                        <p className="text-xs font-700 text-slate-600 leading-5">{analysis.recommendation}</p>
                      </div>
                      <div className="rounded-lg border-2 border-slate-900 bg-white p-4 shadow-[4px_4px_0_#000]">
                        <h4 className="font-black text-sm mb-2">{product2.name} Verdict</h4>
                        <p className="text-xs font-700 text-slate-600 leading-5">{analysis2.recommendation}</p>
                      </div>
                    </div>

                  </motion.div>
                )}

              </div>
            )}

            {/* Scan History Gallery Drawer */}
            {recentScans.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border-2 border-slate-900 bg-white p-5 shadow-[6px_6px_0_#0f172a] mt-2"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-900 text-lg flex items-center gap-2">
                    <History size={18} className="text-emerald-700 animate-spin-slow" />
                    Kitchen Pantry History
                  </h3>
                  <button
                    onClick={() => {
                      synth.playPop()
                      fetchRecentScans()
                    }}
                    className="text-xs font-900 bg-slate-100 border border-slate-900 rounded-full px-3 py-1 flex items-center gap-1 hover:bg-slate-200 active:translate-y-0.5 shadow transition"
                  >
                    <RotateCcw size={12} />
                    Refresh
                  </button>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                  {recentScans.slice(0, 10).map((scan: any, idx: number) => {
                    const prod = scan.product
                    if (!prod) return null
                    
                    return (
                      <motion.div
                        key={scan._id || idx}
                        whileHover={{ scale: 1.03, y: -2 }}
                        onClick={() => {
                          synth.playPop()
                          setBarcode(prod.barcode)
                          setResult({
                            product: prod,
                            analysis: {
                              health_score: scan.healthScore,
                              risk_level: scan.riskLevel,
                              risky_ingredients: [],
                              warnings: scan.warnings,
                              positives: [],
                              recommendation: scan.recommendation
                            }
                          })
                          setIsShowdown(false)
                        }}
                        className="w-40 border-2 border-slate-900 bg-amber-50/20 p-2 rounded-lg shrink-0 cursor-pointer shadow-[3px_3px_0_#000] hover:bg-lime-50 transition"
                      >
                        <div className="h-20 w-full overflow-hidden bg-white border border-slate-200 rounded flex items-center justify-center mb-2">
                          {prod.imageUrl ? (
                            <img src={prod.imageUrl} alt={prod.name} className="h-full object-contain" />
                          ) : (
                            <Soup size={24} className="text-slate-400" />
                          )}
                        </div>
                        <div className="font-black text-xs truncate" title={prod.name}>
                          {prod.name}
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[10px] font-bold">
                          <span className="text-emerald-700">{prod.brand.slice(0, 12)}</span>
                          <span className="rounded bg-slate-900 text-white px-1 text-[9px] font-black">
                            {scan.healthScore}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

          </section>
        </section>
      </div>
    </main>
  )
}
