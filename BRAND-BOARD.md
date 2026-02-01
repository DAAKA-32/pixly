# Pixly - Brand Board

## Brand Identity

**Nom:** Pixly
**Tagline:** Attribution marketing de nouvelle génération
**Positionnement:** Solution SaaS premium d'attribution marketing pour e-commerçants et annonceurs

---

## 1. Logo

### Logo Principal
- **Fichier:** `/public/logo.jpg`
- **Usage:** Navbar, footer, pages d'authentification, communications

### Variantes Disponibles

| Variante | Composant | Usage |
|----------|-----------|-------|
| Logo + Texte | `<Logo size="md" />` | Navigation principale, footer |
| Logo seul | `<LogoIcon size="md" />` | Espaces restreints, favicon, icônes |
| Logo blanc | `<Logo variant="white" />` | Fonds sombres, overlays |

### Tailles Standardisées

```typescript
const sizeMap = {
  xs: { container: 'h-7 w-7', image: 28 },   // Mini - Sidebar collapsed
  sm: { container: 'h-9 w-9', image: 36 },   // Small - Navbar
  md: { container: 'h-10 w-10', image: 40 }, // Medium - Default
  lg: { container: 'h-12 w-12', image: 48 }, // Large - Hero sections
  xl: { container: 'h-14 w-14', image: 56 }, // Extra Large - Auth pages
};
```

### Règles d'Utilisation
- **Espace de protection:** Minimum 8px autour du logo
- **Taille minimale:** 28px (size xs)
- **Fond clair:** Utiliser `variant="default"`
- **Fond sombre:** Utiliser `variant="white"`

---

## 2. Palette de Couleurs

### Couleur Primaire - Vert Premium (Emerald)

La couleur primaire représente la croissance, la confiance et la précision.

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `primary-50` | `#ecfdf5` | rgb(236, 253, 245) | Backgrounds légers, hover states |
| `primary-100` | `#d1fae5` | rgb(209, 250, 229) | Badges, highlights |
| `primary-200` | `#a7f3d0` | rgb(167, 243, 208) | Borders actifs |
| `primary-300` | `#6ee7b7` | rgb(110, 231, 183) | Decorations |
| `primary-400` | `#34d399` | rgb(52, 211, 153) | Hover accent |
| `primary-500` | `#10b981` | rgb(16, 185, 129) | **Couleur principale** |
| `primary-600` | `#059669` | rgb(5, 150, 105) | Hover buttons |
| `primary-700` | `#047857` | rgb(4, 120, 87) | Texte sur fond clair |
| `primary-800` | `#065f46` | rgb(6, 95, 70) | Dark accents |
| `primary-900` | `#064e3b` | rgb(6, 78, 59) | Dark mode |
| `primary-950` | `#022c22` | rgb(2, 44, 34) | Extra dark |

### Couleurs Neutres

| Token | Hex | Usage |
|-------|-----|-------|
| `neutral-50` | `#fafafa` | Page backgrounds |
| `neutral-100` | `#f5f5f5` | Card backgrounds secondaires |
| `neutral-200` | `#e5e5e5` | Borders, dividers |
| `neutral-300` | `#d4d4d4` | Borders hover |
| `neutral-400` | `#a3a3a3` | Placeholder text |
| `neutral-500` | `#737373` | Secondary text |
| `neutral-600` | `#525252` | Body text |
| `neutral-700` | `#404040` | Headlines secondaires |
| `neutral-800` | `#262626` | Dark backgrounds |
| `neutral-900` | `#171717` | **Headlines principales** |
| `neutral-950` | `#0a0a0a` | Extra dark |

### Couleurs Sémantiques

| Couleur | Light | Default | Dark | Usage |
|---------|-------|---------|------|-------|
| Success | `#d1fae5` | `#10b981` | `#065f46` | Validations, confirmations |
| Warning | `#fef3c7` | `#f59e0b` | `#92400e` | Alertes, attention |
| Error | `#fee2e2` | `#ef4444` | `#991b1b` | Erreurs, suppressions |
| Info | `#dbeafe` | `#3b82f6` | `#1e40af` | Informations, tips |

### Dégradés

```css
/* Gradient primaire */
.gradient-primary {
  background: linear-gradient(to bottom right, #34d399, #10b981, #059669);
}

/* Gradient hero */
.gradient-hero {
  background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.15), transparent),
              radial-gradient(ellipse 60% 40% at 80% 60%, rgba(16, 185, 129, 0.08), transparent);
}

/* Gradient mesh (backgrounds) */
.gradient-mesh {
  background-image:
    radial-gradient(at 40% 20%, rgba(16, 185, 129, 0.1) 0px, transparent 50%),
    radial-gradient(at 80% 0%, rgba(5, 150, 105, 0.1) 0px, transparent 50%),
    radial-gradient(at 0% 50%, rgba(110, 231, 183, 0.08) 0px, transparent 50%);
}

/* Text gradient */
.text-gradient {
  background: linear-gradient(to right, #10b981, #34d399, #059669);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## 3. Typographie

### Police Principale: Inter

**Usage:** Titres, corps de texte, interface utilisateur

```css
font-family: 'Inter', system-ui, sans-serif;
```

### Police Monospace: JetBrains Mono

**Usage:** Code, données techniques, métriques

```css
font-family: 'JetBrains Mono', monospace;
```

### Échelle Typographique

| Style | Classe Tailwind | Taille | Weight | Usage |
|-------|-----------------|--------|--------|-------|
| Display | `text-5xl font-bold` | 48px | 700 | Hero titles |
| H1 | `text-4xl font-bold` | 36px | 700 | Page titles |
| H2 | `text-3xl font-bold` | 30px | 700 | Section titles |
| H3 | `text-2xl font-semibold` | 24px | 600 | Card titles |
| H4 | `text-xl font-semibold` | 20px | 600 | Subsections |
| H5 | `text-lg font-medium` | 18px | 500 | Labels importants |
| Body Large | `text-lg` | 18px | 400 | Intro paragraphs |
| Body | `text-base` | 16px | 400 | Corps de texte |
| Body Small | `text-sm` | 14px | 400 | Texte secondaire |
| Caption | `text-xs` | 12px | 400 | Metadata, timestamps |

### Exemples de Combinaisons

```tsx
// Hero Title
<h1 className="text-4xl font-bold text-neutral-900 sm:text-5xl">
  Titre Principal
</h1>

// Subtitle
<p className="text-lg text-neutral-600">
  Description du contenu
</p>

// Section Title
<h2 className="text-3xl font-bold text-neutral-900">
  Titre de Section
</h2>

// Card Title
<h3 className="text-lg font-semibold text-neutral-900">
  Titre de Carte
</h3>
```

---

## 4. Composants UI

### Boutons

| Variant | Classe | Usage |
|---------|--------|-------|
| Primary | `bg-primary-500 text-white` | Actions principales |
| Secondary | `bg-neutral-100 text-neutral-900` | Actions secondaires |
| Outline | `border-2 border-neutral-200 bg-white` | Actions tertiaires |
| Ghost | `text-neutral-600 hover:bg-neutral-100` | Navigation, menus |
| Danger | `bg-error text-white` | Suppressions |
| Link | `text-primary-600 underline` | Liens inline |

### Tailles de Boutons

| Size | Hauteur | Padding | Usage |
|------|---------|---------|-------|
| sm | 36px | px-4 | Compact UI |
| md | 44px | px-6 | Default |
| lg | 48px | px-8 | Emphasis |
| xl | 56px | px-10 | Hero CTAs |

### Cards

```tsx
// Card Standard
<div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
  {/* Content */}
</div>

// Card Premium (avec hover)
<div className="card-premium">
  {/* Content */}
</div>

// Card Metric
<div className="metric-card">
  {/* Content */}
</div>
```

### Inputs

```tsx
<Input
  placeholder="Email"
  icon={<Mail className="h-4 w-4" />}
  error={false}
  success={false}
/>
```

**États:**
- Default: `border-neutral-200`
- Hover: `border-neutral-300`
- Focus: `border-primary-400 ring-2 ring-primary-500/20`
- Error: `border-red-300 bg-red-50/30`
- Success: `border-green-300`

---

## 5. Ombres

| Token | Valeur | Usage |
|-------|--------|-------|
| `shadow-soft` | `0 2px 8px -2px rgba(0,0,0,0.05), 0 4px 16px -4px rgba(0,0,0,0.1)` | Cards, dropdowns |
| `shadow-medium` | `0 4px 12px -2px rgba(0,0,0,0.08), 0 8px 24px -4px rgba(0,0,0,0.12)` | Elevated elements |
| `shadow-strong` | `0 8px 24px -4px rgba(0,0,0,0.12), 0 16px 48px -8px rgba(0,0,0,0.16)` | Modals, popovers |
| `shadow-glow` | `0 0 24px -4px rgba(16,185,129,0.3)` | CTA buttons, highlights |

---

## 6. Border Radius

| Token | Valeur | Usage |
|-------|--------|-------|
| `rounded-lg` | 8px | Inputs, small buttons |
| `rounded-xl` | 12px | Cards, buttons |
| `rounded-2xl` | 16px | Large cards, sections |
| `rounded-3xl` | 24px | Hero elements |
| `rounded-full` | 9999px | Avatars, pills, badges |

---

## 7. Animations

### Animations Disponibles

| Animation | Durée | Usage |
|-----------|-------|-------|
| `fade-in` | 0.5s | Apparition d'éléments |
| `slide-up` | 0.6s | Entrée de sections |
| `scale-in` | 0.4s | Modals, popovers |
| `pulse-soft` | 2s | Indicateurs actifs |
| `float` | 6s | Éléments décoratifs |
| `glow-pulse` | 3s | CTAs importants |
| `shimmer` | 2s | Loading states |

### Transitions Standards

```css
/* Transition rapide - UI feedback */
transition-all duration-200

/* Transition normale - Cards, buttons */
transition-all duration-300

/* Transition lente - Sections, pages */
transition-all duration-500
```

---

## 8. Espacements

### Système de Spacing (basé sur 4px)

| Token | Valeur | Usage |
|-------|--------|-------|
| `p-1` | 4px | Micro spacing |
| `p-2` | 8px | Tight spacing |
| `p-3` | 12px | Compact elements |
| `p-4` | 16px | Standard spacing |
| `p-6` | 24px | Card padding |
| `p-8` | 32px | Section padding |
| `p-12` | 48px | Large sections |
| `p-16` | 64px | Hero sections |

### Container Widths

| Size | Max Width | Usage |
|------|-----------|-------|
| `max-w-md` | 448px | Forms, modals |
| `max-w-lg` | 512px | Medium content |
| `max-w-xl` | 576px | Large forms |
| `max-w-2xl` | 672px | Content blocks |
| `max-w-4xl` | 896px | Wide content |
| `max-w-7xl` | 1280px | Page container |

---

## 9. Iconographie

### Bibliothèque: Lucide React

**Installation:**
```bash
npm install lucide-react
```

**Usage:**
```tsx
import { BarChart3, Zap, Shield } from 'lucide-react';

<BarChart3 className="h-5 w-5 text-primary-500" />
```

### Tailles Standards

| Size | Classe | Usage |
|------|--------|-------|
| xs | `h-4 w-4` | Inline, badges |
| sm | `h-5 w-5` | Navigation, buttons |
| md | `h-6 w-6` | Cards, features |
| lg | `h-8 w-8` | Empty states |
| xl | `h-12 w-12` | Hero icons |

---

## 10. Patterns Visuels

### Grid Pattern
```css
.grid-pattern {
  background-image:
    linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}
```

### Dot Pattern
```css
.dot-pattern {
  background-image: radial-gradient(rgba(16, 185, 129, 0.15) 1px, transparent 1px);
  background-size: 24px 24px;
}
```

### Glass Effect
```css
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

---

## 11. Assets Requis

### Assets Existants
- [x] `/public/logo.jpg` - Logo principal
- [x] `/public/ceo.png` - Photo fondateur
- [x] `/public/pixel.js` - Script tracking

### Assets Recommandés à Créer
- [ ] `/public/logo-white.png` - Logo pour fonds sombres
- [ ] `/public/logo-icon.png` - Icône seule
- [ ] `/public/favicon.ico` - Favicon 32x32
- [ ] `/public/apple-touch-icon.png` - iOS icon 180x180
- [ ] `/public/og-image.png` - Open Graph 1200x630

---

## 12. Checklist Brand Consistency

### Pages
- [x] Landing page - Logo intégré
- [x] Login/Signup - Logo intégré
- [x] Dashboard - Logo intégré
- [x] Sidebar - Logo intégré
- [x] Auth transition - Logo intégré

### Composants
- [x] `<Logo />` - Composant réutilisable
- [x] `<LogoIcon />` - Version icône
- [x] `<Button />` - Variantes définies
- [x] `<Input />` - États visuels
- [x] Cards - Styles cohérents

### Design Tokens
- [x] Couleurs primaires
- [x] Couleurs neutres
- [x] Couleurs sémantiques
- [x] Typographie
- [x] Ombres
- [x] Border radius
- [x] Animations

---

## Usage du Brand Board

Ce document sert de référence unique pour :
1. **Développeurs** - Utiliser les tokens et composants corrects
2. **Designers** - Maintenir la cohérence visuelle
3. **Marketing** - Créer des supports alignés avec la marque

Pour toute modification du brand, mettre à jour ce document et les fichiers associés :
- `tailwind.config.ts` - Design tokens
- `src/app/globals.css` - Styles globaux
- `src/components/ui/` - Composants UI

---

*Dernière mise à jour: Janvier 2026*
*Version: 1.0.0*
