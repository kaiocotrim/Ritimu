"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

const frames = Array.from(
  { length: 10 },
  (_, index) => `/BonecoLogin/mascote%20(${index + 1}).png`
)

const messages = [
  "Acho que errei de planeta.",
  "Onde fica a próxima aula?",
  "Você viu meu caderno?",
  "Preciso encontrar meu ritmo.",
  "Clique em mim!",
  "Vamos estudar juntos?",
  "Uma missão por vez.",
  "Você está indo muito bem!",
  "Não desista agora!",
  "Bora evoluir?",
]

type PasswordState = "idle" | "focused" | "typing"

const passwordReactions: Record<Exclude<PasswordState, "idle">, { frame: string; message: string }> = {
  focused: {
    frame: "/BonecoLogin/mascote%20(11).png",
    message: "Pode digitar, eu vou olhar para o outro lado!",
  },
  typing: {
    frame: "/BonecoLogin/mascote%20(12).png",
    message: "Não vou olhar sua senha, relaxa!",
  },
}

const routes = [
  {
    initial: { x: "-12vw", y: 0 },
    animate: {
      x: ["-12vw", "24vw", "62vw", "108vw"],
      y: [0, 90, 20, 150],
    },
    rotate: [0, 120, 240, 360],
  },
  {
    initial: { x: "48vw", y: "82vh" },
    animate: {
      x: ["48vw", "42vw", "56vw", "72vw"],
      y: ["82vh", "48vh", "16vh", "-34vh"],
    },
    rotate: [0, -80, 70, 180],
  },
]

export function LoginMascot({ passwordState = "idle" }: { passwordState?: PasswordState }) {
  const reduceMotion = useReducedMotion()
  const [frameIndex, setFrameIndex] = useState(0)
  const [routeIndex, setRouteIndex] = useState(0)
  const passwordReaction = passwordState === "idle" ? null : passwordReactions[passwordState]
  const activeFrame = passwordReaction?.frame ?? frames[frameIndex]
  const activeMessage = passwordReaction?.message ?? messages[frameIndex]

  useEffect(() => {
    if (reduceMotion) return

    const interval = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % frames.length)
    }, 4000)

    return () => window.clearInterval(interval)
  }, [reduceMotion])

  return (
    <motion.button
      type="button"
      className="group fixed left-0 top-[18%] z-[2] w-12 cursor-pointer border-0 bg-transparent p-0 will-change-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1887f2]/25 sm:w-14 lg:w-16"
      key={routeIndex}
      initial={reduceMotion ? { x: "82vw", y: 40 } : routes[routeIndex].initial}
      animate={reduceMotion ? { x: "82vw", y: 40 } : routes[routeIndex].animate}
      transition={
        reduceMotion
          ? undefined
          : { duration: 26, times: [0, 0.34, 0.68, 1], ease: "linear" }
      }
      onAnimationComplete={() => {
        if (!reduceMotion) setRouteIndex((current) => (current + 1) % routes.length)
      }}
      onClick={() => setFrameIndex((current) => (current + 1) % frames.length)}
      aria-label={`Mascote: ${activeMessage}. Trocar pose`}
    >
      <div className={`pointer-events-none absolute bottom-[calc(100%+12px)] left-1/2 w-max max-w-52 -translate-x-1/2 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-center text-sm font-medium text-[#1d1d1f] shadow-[0_12px_35px_rgba(15,23,42,.16)] backdrop-blur-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 ${passwordReaction ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={activeMessage}
            className="block"
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {activeMessage}
            {passwordState === "typing" && (
              <Image
                src="/face-with-tears-of-joy_1f602.png"
                alt=""
                width={18}
                height={18}
                className="ml-1 inline-block size-[18px] align-text-bottom"
              />
            )}
          </motion.span>
        </AnimatePresence>
        <span className="absolute left-1/2 top-full size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-white/70 bg-white/80" />
      </div>
      <motion.div
        className="relative aspect-[3/5] w-full"
        animate={reduceMotion ? { rotate: 0 } : { rotate: routes[routeIndex].rotate }}
        transition={reduceMotion ? undefined : { duration: 26, times: [0, 0.34, 0.68, 1], ease: "linear" }}
      >
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={activeFrame}
            className="absolute inset-0"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.94, filter: "blur(3px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 1.04, filter: "blur(3px)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
          <Image
            src={activeFrame}
            alt=""
            fill
            sizes="64px"
            className="object-contain object-center"
            priority={frameIndex === 0}
          />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.button>
  )
}
