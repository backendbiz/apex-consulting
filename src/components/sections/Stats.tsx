'use client'

import { cn } from '@/utils/cn'
import { useEffect, useState, useRef } from 'react'

interface Stat {
  value: string
  label: string
  suffix?: string
}

interface StatsProps {
  stats: Stat[]
  className?: string
}

function AnimatedNumber({ value, suffix = '' }: { value: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  const numericValue = parseInt(value.replace(/\D/g, ''), 10) || 0

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000
    const steps = 60
    const stepTime = duration / steps
    const increment = numericValue / steps

    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= numericValue) {
        setDisplayValue(numericValue)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [isVisible, numericValue])

  return (
    <span ref={ref}>
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  )
}

export function Stats({ stats, className }: StatsProps) {
  return (
    <section className={cn('section bg-white', className)}>
      <div className="container">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const hasPlus = stat.value.includes('+')
            const hasPercent = stat.value.includes('%')
            const suffix = hasPlus ? '+' : hasPercent ? '%' : ''

            return (
              <div key={index} className="text-center">
                <div className="mb-2 text-5xl font-bold text-navy-900 lg:text-6xl">
                  <AnimatedNumber value={stat.value} suffix={suffix} />
                </div>
                <p className="text-sm uppercase tracking-wider text-gray-400">
                  {stat.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
