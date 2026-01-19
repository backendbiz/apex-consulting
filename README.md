# Consulting Website

A modern consulting company website built with Next.js 15, Payload CMS 3, Tailwind CSS v4, and React 19.

## Features

- **Modern Stack**: Next.js 15 App Router with React 19
- **Headless CMS**: Payload CMS v3 with MongoDB
- **Styling**: Tailwind CSS v4 with custom design system
- **Performance**: Server Components, ISR, and optimized images
- **SEO**: Full SEO support with sitemap, robots.txt, and OpenGraph
- **Responsive**: Mobile-first design with professional corporate theme

## Architecture

### Server Components (Default)
- All page components fetch data on the server
- Direct database access via Payload Local API
- Zero network latency for data fetching
- React `cache()` for request deduplication

### Client Components
- Interactive UI elements (search, menus, forms)
- Animated statistics counters
- Mobile navigation toggle

### Data Fetching Pattern
```
src/lib/queries/  → Server-side data fetching (cached)
src/app/api/      → Client-side API routes
```

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- pnpm (recommended) or npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure your `.env.local`:
   ```env
   DATABASE_URI=mongodb://localhost:27017/consulting-cms
   PAYLOAD_SECRET=your-secret-key-min-32-characters-long
   NEXT_PUBLIC_SERVER_URL=http://localhost:3000
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   REVALIDATION_SECRET=your-revalidation-secret
   ```

5. Run the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) for the website
7. Open [http://localhost:3000/admin](http://localhost:3000/admin) for the CMS

### First-time Setup

1. Navigate to `/admin`
2. Create your first admin user
3. Configure Site Settings in the globals
4. Add categories for services
5. Create services with pricing
6. Configure navigation and footer

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (frontend)/         # Public website routes
│   │   ├── page.tsx        # Homepage
│   │   ├── about/          # About page
│   │   ├── services/       # Services pages
│   │   └── contact/        # Contact page
│   ├── (payload)/          # Payload CMS admin
│   │   └── admin/          # Admin panel
│   └── api/                # API routes
│       ├── [...payload]/   # Payload REST API
│       └── graphql/        # GraphQL endpoint
├── collections/            # Payload collections
│   ├── Users.ts            # Admin users
│   ├── Media.ts            # Image uploads
│   ├── Pages.ts            # Static pages
│   ├── Services.ts         # Service offerings
│   └── Categories.ts       # Service categories
├── globals/                # Payload globals
│   ├── SiteSettings.ts     # Site configuration
│   ├── Navigation.ts       # Menu configuration
│   └── Footer.ts           # Footer content
├── components/             # React components
│   ├── ui/                 # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Icon.tsx
│   │   ├── Input.tsx
│   │   └── Textarea.tsx
│   ├── layout/             # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── WhatsAppButton.tsx
│   └── sections/           # Page sections
│       ├── Hero.tsx
│       ├── Features.tsx
│       ├── About.tsx
│       ├── Stats.tsx
│       ├── CTABanner.tsx
│       ├── ServicesGrid.tsx
│       ├── ContactForm.tsx
│       └── Clients.tsx
├── lib/                    # Core logic
│   ├── payload.ts          # Payload client helper
│   └── queries/            # Server-side data fetching
│       ├── services.ts
│       ├── pages.ts
│       └── globals.ts
└── utils/                  # Pure utility functions
    └── cn.ts               # Class name helper
```

## Collections

### Users
Admin users with roles (admin, editor).

### Media
Image uploads with multiple responsive sizes:
- thumbnail (400x300)
- card (768x576)
- feature (1024x576)
- hero (1920x1080)

### Categories
Service categories for organization.

### Services
Service offerings with:
- Title, description, content
- Icon selection
- Pricing (current and original price)
- Price units (hour, day, month, project, one-time)
- Features list
- Featured flag
- Ordering

### Pages
Dynamic pages with block-based layouts:
- Content blocks
- CTA blocks
- Features grids
- Statistics
- Team sections

## Globals

### Site Settings
- Site name and description
- Logo and favicon
- Contact information (email, phone, address, WhatsApp)
- Social media links
- Default SEO settings

### Navigation
- Main navigation items
- Dropdown support
- CTA button configuration

### Footer
- About text
- Quick links
- Office locations
- Copyright text
- Bottom links

## Design System

### Colors
- **Navy Blue** (#0A1F44): Primary brand color
- **Bright Blue** (#0099FF): CTAs and highlights
- **Neutral grays**: Background and text variations
- **Success Green** (#00D084): WhatsApp and success states

### Typography
- **Headings**: Montserrat (bold)
- **Body**: Open Sans (regular)

### Components
- Responsive buttons with hover effects
- Cards with lift animations
- Form inputs with focus states
- Icon system using Lucide React

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm generate:types  # Generate Payload TypeScript types
```

## Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URI` | MongoDB connection string | Yes |
| `PAYLOAD_SECRET` | Secret for Payload auth (min 32 chars) | Yes |
| `NEXT_PUBLIC_SERVER_URL` | Server URL for API calls | Yes |
| `NEXT_PUBLIC_SITE_URL` | Public site URL | Yes |
| `REVALIDATION_SECRET` | Secret for ISR revalidation | No |
| `S3_BUCKET` | S3/R2 bucket name | No |
| `S3_ACCESS_KEY_ID` | S3/R2 access key | No |
| `S3_SECRET_ACCESS_KEY` | S3/R2 secret key | No |
| `S3_REGION` | S3/R2 region | No |
| `S3_ENDPOINT` | S3/R2 endpoint | No |
| `RESEND_API_KEY` | Resend API key for emails | No |

## Customization

### Adding New Services
1. Go to `/admin`
2. Navigate to Services collection
3. Add new service with all details
4. Set status to "Published"

### Modifying Design
1. Edit `src/app/globals.css` for Tailwind theme customization
2. Update color variables in the `@theme` block
3. Add custom utilities in `@layer utilities`

### Adding New Sections
1. Create component in `src/components/sections/`
2. Export from `src/components/sections/index.ts`
3. Import and use in page components

## License

MIT
