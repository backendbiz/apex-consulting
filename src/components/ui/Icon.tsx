import {
  Briefcase,
  BarChart3,
  Users,
  Target,
  Lightbulb,
  Shield,
  Globe,
  Building2,
  TrendingUp,
  Award,
  ClipboardList,
  Calculator,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  type LucideProps,
} from 'lucide-react'

const icons = {
  briefcase: Briefcase,
  'chart-bar': BarChart3,
  chart: BarChart3,
  users: Users,
  target: Target,
  lightbulb: Lightbulb,
  shield: Shield,
  globe: Globe,
  building: Building2,
  'trending-up': TrendingUp,
  award: Award,
  clipboard: ClipboardList,
  calculator: Calculator,
  phone: Phone,
  mail: Mail,
  'map-pin': MapPin,
  clock: Clock,
  'check-circle': CheckCircle,
  'arrow-right': ArrowRight,
  menu: Menu,
  x: X,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
}

export type IconName = keyof typeof icons

interface IconProps extends LucideProps {
  name: IconName
}

export function Icon({ name, ...props }: IconProps) {
  const IconComponent = icons[name]
  if (!IconComponent) {
    return null
  }
  return <IconComponent {...props} />
}
